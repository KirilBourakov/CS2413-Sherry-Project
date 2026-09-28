from rest_framework.authentication import BaseAuthentication
from knox.auth import TokenAuthentication as KnoxTokenAuthentication
from rest_framework.exceptions import AuthenticationFailed, NotAuthenticated

class OptionalTokenAuthentication(BaseAuthentication):
    def authenticate(self, request):
        if request.method == 'GET':
            try:
                return KnoxTokenAuthentication().authenticate(request)
            except (NotAuthenticated, AuthenticationFailed):
                return None
        return KnoxTokenAuthentication().authenticate(request)

    def authenticate_header(self, request):
        return None