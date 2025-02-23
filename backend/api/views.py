import requests
import logging
from rest_framework import generics
from django.core.mail import send_mail
from django.conf import settings
from .models import ClientRequest
from .serializers import ClientRequestSerializer
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt


logger = logging.getLogger(__name__)

MAKE_WEBHOOK_URL = "https://hook.eu2.make.com/l4g1ictm3yyft7s904r7lgxcp0mh59mw"

def send_to_make_webhook(payload):
    try:
        response = requests.post(MAKE_WEBHOOK_URL, json=payload)
        response.raise_for_status()  
        logger.info(f"Webhook success: {response.status_code}")
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to send data to Make: {e}")

def send_completion_email(email, name, issue):
    """Mengirim email ke klien saat status berubah menjadi 'done'"""
    subject = "Your Request Has Been Completed!"
    message = f"""
    Hi {name},

    Your request regarding "{issue}" has been marked as DONE. 
    If you need further assistance, feel free to reach out.

    Best regards,
    Your Support Team
    """
    
    try:
        send_mail(
            subject, 
            message, 
            settings.DEFAULT_FROM_EMAIL, 
            [email], 
            fail_silently=False 
        )
        logger.info(f"Email sent successfully to {email}")
    except Exception as e:
        logger.error(f"Failed to send email to {email}: {e}")

@csrf_exempt
def update_status_from_make(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            request_id = data.get("id")
            new_status = data.get("status")

            if request_id and new_status:
                try:
                    client_request = ClientRequest.objects.get(id=request_id)
                    client_request.status = new_status
                    client_request.save()
                    
                    if new_status.lower() == "done":
                        send_completion_email(client_request.email, client_request.name, client_request.issue)
                    
                    return JsonResponse({"message": "Status updated successfully"}, status=200)
                except ClientRequest.DoesNotExist:
                    return JsonResponse({"error": "Client request not found"}, status=404)
            else:
                return JsonResponse({"error": "Missing 'id' or 'status'"}, status=400)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format"}, status=400)

    return JsonResponse({"error": "Invalid request method"}, status=405)

class ClientRequestListCreateView(generics.ListCreateAPIView):
    queryset = ClientRequest.objects.all()
    serializer_class = ClientRequestSerializer

    def perform_create(self, serializer):
        client_request = serializer.save()

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

class ClientRequestDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ClientRequest.objects.all()
    serializer_class = ClientRequestSerializer

    def perform_update(self, serializer):
        client_request = serializer.save()

        payload = {
            "action": "update",
            "id": client_request.id,
            "name": client_request.name,
            "email": client_request.email,
            "issue": client_request.issue,
            "status": client_request.status,
        }

        send_to_make_webhook(payload)

        if client_request.status.lower() == "done":
            send_completion_email(client_request.email, client_request.name, client_request.issue)

    def perform_destroy(self, instance):
        payload = {
            "action": "delete",
            "id": instance.id,
            "name": instance.name,
            "email": instance.email,
            "issue": instance.issue,
            "status": instance.status,
        }

        send_to_make_webhook(payload)
        super().perform_destroy(instance)
