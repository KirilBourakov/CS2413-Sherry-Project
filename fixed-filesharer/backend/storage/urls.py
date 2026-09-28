from django.urls import path, include
from . import views

urlpatterns = [
    path('directory', views.DirectoryAPI.as_view(), name='directory'),
    path('search', views.SearchAPI.as_view(), name='Search'),
    path('getDirectoryId', views.DirectoryId.as_view(), name='DirectoryId'),
    path('file', views.FileAPI.as_view(), name='file'),
    path('fileInfo', views.FileInfoAPI.as_view(), name='FileInfo'),
    path('fileInfo/<str:pk>', views.FileInfoAPI.as_view(), name='FileInfoId'),
]