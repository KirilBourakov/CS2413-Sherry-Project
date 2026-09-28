from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from django.core.exceptions import ValidationError
from rest_framework import exceptions

UserModel = get_user_model()

class UserRegisterSerializer(serializers.Serializer):
    class Meta:
        model = UserModel
        fields = ('username', 'password')
        extra_kwargs = {'password': {'write_only': True}}
    def create(self, validated_data):
        email = validated_data.get('email', '')
        user = UserModel.objects.create(
            username=validated_data['username'],
            email=email,
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def check(self, validated_data):
        user = authenticate(
            username=validated_data['username'],
            password=validated_data['password']
        )
        if not user:
            raise exceptions.AuthenticationFailed('User not found. Please check you information and try again.')
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserModel
        fields = ['username', 'pk']