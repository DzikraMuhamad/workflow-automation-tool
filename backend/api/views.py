import requests
from rest_framework import generics
from .models import ClientRequest
from .serializers import ClientRequestSerializer


MAKE_WEBHOOK_URL = "https://hook.eu2.make.com/c8c2cgzcw0dc5dx74xyt9ww5vwyrcrja"

class ClientRequestListCreateView(generics.ListCreateAPIView):
    queryset = ClientRequest.objects.all()
    serializer_class = ClientRequestSerializer

    def perform_create(self, serializer):
        # Simpan request ke database
        client_request = serializer.save()

        # Kirim data ke MAKE webhook
        payload = {
            "id": client_request.id,
            "name": client_request.name,
            "email": client_request.email,
            "issue": client_request.issue,
            "status": client_request.status,
            "created_at": client_request.created_at.strftime("%Y-%m-%d %H:%M:%S"),
        }

        try:
            requests.post(MAKE_WEBHOOK_URL, json=payload)
        except requests.exceptions.RequestException as e:
            print(f"Failed to send data to MAKE: {e}")
