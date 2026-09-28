from django.contrib import admin
from storage.models import Directory, File
from django.contrib.auth.models import User

# Register your models here.
admin.site.register(Directory)
admin.site.register(File)
