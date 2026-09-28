from django.db import models
from django.conf import settings
from django.contrib.auth.models import User
import uuid, os

# Create your models here.

class Directory(models.Model):
    name = models.TextField(blank=False)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_directories')
    shared_with = models.ManyToManyField(User, blank=True, related_name='shared_directories')
    tags = models.CharField(max_length=100, blank=True, null=True)
    public = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.owner}{self.name} ({self.id})"

    class Meta:
        unique_together = [['parent', 'name']]

def upload_handler(instance, filename):
    ext = filename.split(".")[-1]
    instance.filename = filename
    filename = f"{instance.author.username}/{instance.id}.{ext}"
    return os.path.join(settings.UPLOAD_ROOT, filename)
class File(models.Model):
    id = models.UUIDField(unique=True, primary_key=True, default=uuid.uuid4)

    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_files')
    shared_with = models.ManyToManyField(User, blank=True, related_name='shared_files')

    file = models.FileField(upload_to=upload_handler)
    filename = models.CharField(max_length=255, blank=True, null=True)
    directory = models.ForeignKey(Directory, on_delete=models.CASCADE, null=False, blank=False)

    tags = models.CharField(max_length=100, blank=True, null=True)
    public = models.BooleanField(default=False)
