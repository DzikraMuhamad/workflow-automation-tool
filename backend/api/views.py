from rest_framework import generics
from .models import ClientRequest
from .serializers import ClientRequestSerializer

class ClientRequestListCreateView(generics.ListCreateAPIView):
    queryset = ClientRequest.objects.all()
    serializer_class = ClientRequestSerializer

    def perform_create(self, serializer):
        serializer.save()
