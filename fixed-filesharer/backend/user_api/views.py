from tokenize import TokenError

from django.contrib.auth import get_user_model, login, logout
from rest_framework.request import Request
from rest_framework_simplejwt.exceptions import InvalidToken
from rest_framework_simplejwt.settings import api_settings
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenBlacklistView

from .serializers import UserRegisterSerializer, UserSerializer
from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response

REFRESH_KEY = 'refresh_token'

# Create your views here.
class UserRegister(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            user = serializer.create(request.data)
            if user:
                login(request, user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class Login(TokenObtainPairView):
    def post(self, request: Request, *args, **kwargs) -> Response:
        data = super().post(request, *args, **kwargs).data
        if 'access' in data and 'refresh' in data:
            response = Response({'access': data['access']}, status=status.HTTP_200_OK)
            response.set_cookie(
                key=REFRESH_KEY,
                value=data['refresh'],
                max_age=int(api_settings.REFRESH_TOKEN_LIFETIME.total_seconds()),
                httponly=True,
                secure=False,   # Can't use HTTP on localhost, unfortunately
                samesite="Lax",
            )
            return response
        return Response(status=status.HTTP_401_UNAUTHORIZED)

class Refresh(TokenRefreshView):
    def post(self, request: Request, *args, **kwargs) -> Response:
        key = request.COOKIES.get(REFRESH_KEY)
        if key is None:
            return Response(status=status.HTTP_401_UNAUTHORIZED)

        serializer = self.get_serializer(data={'refresh': key})
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)

class Logout(TokenBlacklistView):
    def post(self, request: Request, *args, **kwargs) -> Response:
        key = request.COOKIES.get(REFRESH_KEY)
        if key is None:
            response = Response(status=status.HTTP_401_UNAUTHORIZED)
            response.delete_cookie(key=REFRESH_KEY)
            return response

        request.data['refresh'] = key
        super().post(request, *args, **kwargs)

        serializer = self.get_serializer(data={'refresh': key})
        try:
            serializer.is_valid(raise_exception=True)
            response = Response(serializer.validated_data, status=status.HTTP_200_OK)
        except TokenError as e:
            response = Response(status=status.HTTP_401_UNAUTHORIZED)
        response.delete_cookie(key=REFRESH_KEY)
        return response


class GetUser(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

class CheckUser(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        print(request.user.is_authenticated)
        return Response(status=status.HTTP_200_OK)
