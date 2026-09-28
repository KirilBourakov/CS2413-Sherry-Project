from django.shortcuts import render, HttpResponse
from django.http import FileResponse
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from .serializers import DirectoryContentDirectorySerializer, DirectoryContentFileSerializer, UploadSerializer, CreateDirectorySerializer, FileSerializer, FileInfoSerializer, SearchPayloadSerializer
from .models import File, Directory
from rest_framework.views import APIView
from rest_framework.authentication import SessionAuthentication
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import permissions, status, viewsets, parsers
from knox.auth import TokenAuthentication
from .authenticators import OptionalTokenAuthentication

# Create your views here.
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
            files = File.objects.filter(shared_with=user)
        else:
            files = File.objects.filter(author=user).filter(directory__name=requested_directory)
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
        directory = get_object_or_404(Directory, pk=id, author=request.user)
        directory.delete()
        return Response(status=status.HTTP_200_OK)

class SearchAPI(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = SearchPayloadSerializer(data = request.data)
        if serializer.is_valid():
            search_data = serializer.validated_data
            directories = Directory.objects.all()
            files = File.objects.all()
            
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

class DirectoryId(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        directory = Directory.objects.get(owner=request.user, name=request.GET.get('path', '/'))
        return Response({
            'id': directory.id
        }, status=status.HTTP_200_OK)

class FileAPI(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]
    
    authentication_classes = [OptionalTokenAuthentication]
    parser_classes = [parsers.MultiPartParser]

    def get(self, request, *args, **kwargs):
        requested_file = request.GET.get('file', None)
        if requested_file is None:
            return Response({'error': 'no file requested'}, status=status.HTTP_400_BAD_REQUEST) 
        if request.user.is_authenticated:
            allowed = Q(pk=requested_file, author=request.user) | Q(pk=requested_file, shared_with=request.user)
        else:
            allowed = Q(pk=requested_file, public=True)
        try:
            file = File.objects.filter(allowed).first()
        except File.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)    
        response = FileResponse(file.file.open(), filename=file.filename)
        return response

    def post(self, request, *args, **kwargs):
        print(request.data)
        serializer = UploadSerializer(data=request.data, context={'request': request})
        print(serializer)
        if serializer.is_valid():
            print('-----------------------------------')
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, *args, **kwargs):
        requested_file = request.GET.get('file', None)
        if requested_file is None:
            return Response({'error': 'no file requested'}, status=status.HTTP_400_BAD_REQUEST) 
        file = get_object_or_404(File, pk=requested_file, author=request.user)
        file.delete()
        return Response(status=status.HTTP_200_OK)
    
class FileInfoAPI(APIView):
    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]
    authentication_classes = [OptionalTokenAuthentication]

    def get(self, request, *args, **kwargs):
        requested_file = request.GET.get('file', None)
        if requested_file is None:
            return Response({'error': 'no file requested'}, status=status.HTTP_400_BAD_REQUEST) 
        
        try:
            if request.user.is_authenticated:
                file = File.objects.filter(Q(author=request.user) | Q(shared_with=request.user)).filter(id=requested_file).first()
            else:
                file =  File.objects.filter(public=True).filter(id=requested_file).first()
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