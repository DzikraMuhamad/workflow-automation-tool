import requests
import logging
from rest_framework import generics
from .models import ClientRequest
from .serializers import ClientRequestSerializer

# Logging untuk debugging
logger = logging.getLogger(__name__)

# URL Webhook dari Make.com
MAKE_WEBHOOK_URL = "https://hook.eu2.make.com/c8c2cgzcw0dc5dx74xyt9ww5vwyrcrja"

# Fungsi untuk mengirim data ke Make Webhook
def send_to_make_webhook(payload):
    try:
        response = requests.post(MAKE_WEBHOOK_URL, json=payload)
        response.raise_for_status()  # Raise error jika status code bukan 2xx
        logger.info(f"Webhook success: {response.status_code}")
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to send data to Make: {e}")

# ✅ View untuk menampilkan daftar & membuat ClientRequest
class ClientRequestListCreateView(generics.ListCreateAPIView):
    queryset = ClientRequest.objects.all()
    serializer_class = ClientRequestSerializer

    def perform_create(self, serializer):
        client_request = serializer.save()

        # Kirim data ke Make Webhook (CREATE)
        payload = {
            "action": "create",
            "id": client_request.id,
            "name": client_request.name,
            "email": client_request.email,
            "issue": client_request.issue,
            "status": client_request.status,
            "created_at": client_request.created_at.strftime("%Y-%m-%d %H:%M:%S"),
        }

        send_to_make_webhook(payload)

# ✅ View untuk menampilkan, mengupdate, dan menghapus ClientRequest
class ClientRequestDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ClientRequest.objects.all()
    serializer_class = ClientRequestSerializer

    def perform_update(self, serializer):
        client_request = serializer.save()

        # Kirim data ke Make Webhook (UPDATE)
        payload = {
            "action": "update",
            "id": client_request.id,
            "name": client_request.name,
            "email": client_request.email,
            "issue": client_request.issue,
            "status": client_request.status,
        }

        send_to_make_webhook(payload)

    def perform_destroy(self, instance):
        # Kirim data ke Make Webhook (DELETE)
        payload = {
            "action": "delete",
            "id": instance.id,
            "name": instance.name,
            "email": instance.email,
            "issue": instance.issue,
            "status": instance.status,
        }

        send_to_make_webhook(payload)

        # Hapus dari database setelah webhook sukses
        super().perform_destroy(instance)
