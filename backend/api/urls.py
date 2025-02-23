from django.urls import path
from .views import ClientRequestListCreateView, ClientRequestDetailView, update_status_from_make

urlpatterns = [
    path('client-requests/', ClientRequestListCreateView.as_view(), name='client-requests'),
    path('client-requests/<int:pk>/', ClientRequestDetailView.as_view(), name='client-request-detail'),
    path('update-status/', update_status_from_make, name='update-status'),  
]
