import base64
import json
import os
import time
import uuid
from dataclasses import dataclass, asdict, field
from typing import Literal

from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from django.shortcuts import render, HttpResponse
from django.http import FileResponse
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from dotenv import load_dotenv
from rest_framework_simplejwt.authentication import JWTAuthentication

from .serializers import DirectoryContentDirectorySerializer, DirectoryContentFileSerializer, UploadSerializer, CreateDirectorySerializer, FileInfoSerializer, SearchPayloadSerializer
from .models import File, Directory
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import permissions, status, parsers

# Get, make and delete directory
class DirectoryAPI(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        user = request.user
        requested_directory = request.GET.get('path', '/')

        if requested_directory == '/Shared_With_Me/':
            subdirectories = Directory.objects.filter(shared_with=user) 
        else:
            subdirectories = Directory.objects.filter(owner=user).filter(parent__name=requested_directory)
        directory_serializer = DirectoryContentDirectorySerializer(subdirectories, many=True)

        if requested_directory == '/Shared_With_Me/':
            files = File.objects.filter(shared_with=user, pending=False)
        else:
            files = File.objects.filter(author=user, pending=False).filter(directory__name=requested_directory)
        file_serializer = DirectoryContentFileSerializer(files, many=True)

        data = {
            'files': file_serializer.data,
            'directories': directory_serializer.data
        }
        return Response(data, status=status.HTTP_200_OK)
    
    def post(self, request):
        serializer = CreateDirectorySerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request):
        id = request.GET.get('id', None)
        if id is None:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        directory = get_object_or_404(Directory, pk=id, owner=request.user)
        directory.delete()
        return Response(status=status.HTTP_200_OK)

# Search through files
class SearchAPI(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = SearchPayloadSerializer(data = request.data)
        if serializer.is_valid():
            search_data = serializer.validated_data
            directories = Directory.objects.all()
            files = File.objects.all().filter(pending=False)
            
            fileQ = Q()
            directoryQ = Q()
            if search_data.get('searchSharedWith') and request.user.is_authenticated:
                fileQ |= Q(shared_with=request.user)
                directoryQ |= Q(shared_with=request.user)
            if search_data.get('searchPublic'):
                fileQ |= Q(public=True)
                directoryQ |= Q(public=True)
            if search_data.get('searchMine') and request.user.is_authenticated:
                fileQ |= Q(author=request.user)
                directoryQ |= Q(owner=request.user)
            files = files.filter(fileQ)
            directories = directories.filter(directoryQ)

            for key in search_data['search_criteria']:
                query_data = search_data['search_criteria'][key]
                query = query_data['query']
                fileQ = Q()
                directoryQ = Q()
                if query_data['useTags']:
                    fileQ |= Q(tags__icontains=query)
                    directoryQ |= Q(tags__icontains=query)
                if query_data['useName']:
                    fileQ |= Q(filename__icontains=query)
                    directoryQ |= Q(name__icontains=query)
                if query_data['useOwner']:
                    fileQ |= Q(author__username__icontains=query)
                    directoryQ |= Q(owner__username__icontains=query)
                if query_data['useSharedWith']:
                    fileQ |= Q(shared_with__username__icontains=query)
                    directoryQ |= Q(shared_with__username__icontains=query)
                files = files.filter(fileQ)
                directories = directories.filter(directoryQ)

            directory_serializer = DirectoryContentDirectorySerializer(directories, many=True)
            file_serializer = DirectoryContentFileSerializer(files, many=True)
            data = {
                'files': file_serializer.data,
                'directories': directory_serializer.data
            }
            return Response(data, status=status.HTTP_200_OK)
        return Response(status=status.HTTP_400_BAD_REQUEST)       

# get id of directory
class DirectoryId(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        directory = Directory.objects.get(owner=request.user, name=request.GET.get('path', '/'))
        return Response({
            'id': directory.id
        }, status=status.HTTP_200_OK)


class FileInfoAPI(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [AllowAny]

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get(self, request, *args, **kwargs):
        requested_file = request.GET.get('file', None)
        if requested_file is None:
            return Response({'error': 'no file requested'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            if request.user.is_authenticated:
                file = File.objects.filter(Q(author=request.user, pending=False) | Q(shared_with=request.user, pending=False)).filter(
                    id=requested_file).first()
            else:
                file = File.objects.filter(public=True, pending=False).filter(id=requested_file).first()
        except File.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = FileInfoSerializer(file, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, pk):
        if pk is None:
            return Response({'error': 'no file requested'}, status=status.HTTP_400_BAD_REQUEST)
        instance = get_object_or_404(File, pk=pk, author=request.user)
        serializer = FileInfoSerializer(instance, data=request.data, partial=True, context={'request': request})
        print(serializer)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request, pk):
        user = request.data.get('user')
        action = request.data.get('action')
        if not user or not action:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        if pk is None:
            return Response({'error': 'no file requested'}, status=status.HTTP_400_BAD_REQUEST)
        file = get_object_or_404(File, pk=pk, author=request.user)

        if user[0] == '#':
            user = get_object_or_404(User, pk=user[1:])
        else:
            user = get_object_or_404(User, username=user)

        if action == 'add':
            file.shared_with.add(user)
        if action == 'remove':
            file.shared_with.remove(user)
        file.save()
        return Response(status=status.HTTP_200_OK)


class FileAPI(APIView):
    _aesgcm = None

    @classmethod
    def aesgcm(cls) -> AESGCM:
        if not cls._aesgcm:
            cls._aesgcm = AESGCM(bytes.fromhex(os.getenv("FILE_KEY")))
        return cls._aesgcm

    @dataclass(frozen=True)
    class FileRequest:
        file_uuid: str
        file_name: str
        user_id: int
        action: Literal['GET', 'POST', 'DELETE', 'UPLOAD_SUCCESS']
        time: int = field(default_factory=lambda: int(time.time()))

        @staticmethod
        def from_cypher(ciphertext: str) -> "FileRequest":
            raw_data = base64.b64decode(ciphertext.encode("utf-8"))
            nonce = raw_data[:12]
            content = raw_data[12:]

            json_str = FileAPI.aesgcm().decrypt(nonce, content, None).decode("utf-8")
            return FileAPI.FileRequest(**json.loads(json_str))

        @property
        def encrypted(self) -> str:
            nonce = os.urandom(12)
            return base64.b64encode((nonce + FileAPI.aesgcm().encrypt(nonce, str(self).encode(), None))).decode("utf-8")

        def __str__(self):
            return json.dumps(asdict(self))

    def get_permissions(self):
        if self.request.method == 'GET' or self.request.method == 'PATCH':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    authentication_classes = [JWTAuthentication]

    def get(self, request, *args, **kwargs):
        requested_file = request.GET.get('file', None)
        if requested_file is None:
            return Response({'error': 'no file requested'}, status=status.HTTP_400_BAD_REQUEST)

        if request.user.is_authenticated:
            allowed = (
                Q(pk=requested_file, author=request.user, pending=False) |
                Q(pk=requested_file, shared_with=request.user, pending=False) |
                Q(pk=requested_file, public=True, pending=False)
            )
        else:
            allowed = Q(pk=requested_file, public=True, pending=False)
        try:
            file = File.objects.filter(allowed, pending=False).first()
        except File.DoesNotExist:
            file = None
        if file is None:
            return Response({'error': 'file not found'}, status=status.HTTP_404_NOT_FOUND)

        data = FileAPI.FileRequest(
            file_uuid=str(file.id),
            file_name=file.filename,
            user_id=file.author.id,
            action='GET'
        )

        return Response({"key": data.encrypted}, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        serializer = UploadSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()

            data = FileAPI.FileRequest(
                file_uuid=serializer.data['id'],
                file_name=serializer.data['filename'],
                user_id=serializer.data['author'],
                action="POST"
            )

            return Response({"key": data.encrypted}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, *args, **kwargs):
        requested_file = request.GET.get('file', None)
        if requested_file is None:
            return Response({'error': 'no file requested'}, status=status.HTTP_400_BAD_REQUEST) 
        file = get_object_or_404(File, pk=requested_file, author=request.user)

        data = FileAPI.FileRequest(
            file_uuid=str(file.id),
            file_name=file.filename,
            user_id=file.author.id,
            action='DELETE'
        )

        file.delete()
        return Response({"key": data.encrypted}, status=status.HTTP_200_OK)

    def patch(self, request, *args, **kwargs):
        key = request.data.get('key', None)
        data = FileAPI.FileRequest.from_cypher(key)

        if data.action == 'UPLOAD_SUCCESS':
            file = File.objects.get(id=data.file_uuid)
            file.pending = False
            file.save()
            return Response(status=status.HTTP_200_OK)
        return Response(status=status.HTTP_400_BAD_REQUEST)