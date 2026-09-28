from rest_framework import serializers
from .models import File, Directory
from django.db import IntegrityError
from django.shortcuts import get_object_or_404
import os

class DirectoryContentFileSerializer(serializers.ModelSerializer):
    show = serializers.SerializerMethodField()
    class Meta:
        model = File
        fields = ['filename', 'id', 'tags', 'show']
    def get_show(self, obj):
        return True

class DirectoryContentDirectorySerializer(serializers.ModelSerializer):
    directory_name = serializers.SerializerMethodField()
    path = serializers.SerializerMethodField()
    show = serializers.SerializerMethodField()
    class Meta:
        model = Directory
        fields = ['path', 'directory_name', 'id', 'tags', 'show']

    def get_directory_name(self, obj):
        return obj.name.strip('/').split('/')[-1]
    def get_path(self, obj):
        return obj.name
    def get_show(self, obj):
        return True
    
class CreateDirectorySerializer(serializers.ModelSerializer):
    parent = serializers.CharField(max_length=100)

    class Meta:
        model = Directory
        fields = ['name', 'tags', 'parent']

    def validate_parent(self, value):
        user = self.context['request'].user
        parent = get_object_or_404(Directory, owner=user, name=value)
        return parent
    
    def validate_name(self, value):
        if "/" in value or type(value) != 'string':
            raise serializers.ValidationError("Invalid name")
        return value
    
    def create(self, validated_data):  
        user = self.context['request'].user
        parent = validated_data.get('parent')
        if not parent:
            raise serializers.ValidationError("Parent does not exist or user does not have access.")
        fullName = getattr(parent, 'name') + validated_data['name']
        
        try: 
            return Directory.objects.create(
                name=fullName,
                parent=parent,
                owner=user,
                tags=validated_data['tags']
            )
        except IntegrityError:
            raise serializers.ValidationError('A directory with this name already exists')

class SearchCriteriaSerializer(serializers.Serializer):
    query = serializers.CharField(required=False, allow_blank=True)
    useTags = serializers.BooleanField(required=False)
    useName = serializers.BooleanField(required=False)
    useOwner = serializers.BooleanField(required=False)
    useSharedWith = serializers.BooleanField(required=False)

class SearchPayloadSerializer(serializers.Serializer):
    search_criteria = serializers.DictField(child=SearchCriteriaSerializer())
    searchSharedWith = serializers.BooleanField(required=False)
    searchPublic = serializers.BooleanField(required=False)
    searchMine = serializers.BooleanField(required=False)

class UploadSerializer(serializers.ModelSerializer):
    directory = serializers.CharField(max_length=100)
    
    class Meta:
        model = File
        fields = ['file', 'filename', 'directory', 'tags']

    def validate_directory(self, value):
        # Validate that the directory exists for the current user
        user = self.context['request'].user
        print(';;;;;;;;;;;;;;;;;;;;;')
        directory = get_object_or_404(Directory, owner=user, name=value)
        return directory

    def create(self, validated_data):
        user = self.context['request'].user
        directory = validated_data.get('directory')
        if not directory:
            raise serializers.ValidationError("Directory does not exist or user does not have access.")
        return File.objects.create(
            author=user,
            file=validated_data['file'], 
            filename=validated_data['filename'],
            tags=validated_data['tags'],
            directory=directory,     
        )    

class CustomFileField(serializers.FileField):
    def to_representation(self, value):
        # `value` is the file-like object or binary data
        if hasattr(value, 'read'):
            # If `value` is a file-like object (e.g., FileField in Django)
            return value.read()
        return value  # If `value` is already binary data

    def to_internal_value(self, data):
        return data
class FileSerializer(serializers.ModelSerializer):
    file = CustomFileField()
    class Meta:
        model = File
        fields = ['file']
class FileInfoSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    is_author = serializers.SerializerMethodField()
    shared_with = serializers.SerializerMethodField()

    class Meta:
        model = File
        fields = ['shared_with', 'filename', 'tags', 'public', 'author_name', 'is_author', 'id']

    def get_shared_with(self, instance):
        return [{'id': user.id, 'username': user.username} for user in instance.shared_with.all()] 
    
    def get_author_name(self, obj):
        return obj.author.username
    def get_is_author(self, obj):
        user = self.context['request'].user
        if user.is_authenticated:
            return obj.author == user
        return False