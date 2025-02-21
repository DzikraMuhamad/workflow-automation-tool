from django.urls import path
from .views import ClientRequestListCreateView, ClientRequestDetailView

urlpatterns = [
    path('client-requests/', ClientRequestListCreateView.as_view(), name='client-requests'),
    path('client-requests/<int:pk>/', ClientRequestDetailView.as_view(), name='client-request-detail'),  # Tambahkan ini
]
