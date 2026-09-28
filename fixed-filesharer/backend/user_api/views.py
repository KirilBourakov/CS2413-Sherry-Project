from django.contrib.auth import get_user_model, login, logout
from .serializers import UserRegisterSerializer, UserSerializer
from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from knox.views import LoginView as KnoxLoginView

# Create your views here.
class UserRegister(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        # add validation
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            user = serializer.create(request.data)
            if user:
                login(request, user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)

class UserLogin(KnoxLoginView):
    authentication_classes = [BasicAuthentication]
        
class UserLogout(APIView):
    def post(self, request):
        logout(request)
        return Response(status=status.HTTP_200_OK)

class GetUser(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class CheckUser(APIView):
    permission_classes = [permissions.AllowAny]
    def get(self, request):
        return Response(status=status.HTTP_200_OK)
