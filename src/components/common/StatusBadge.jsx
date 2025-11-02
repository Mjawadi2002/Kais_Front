import React from 'react';
import { Badge } from 'react-bootstrap';

export default function StatusBadge({ status }){
  const map = {
    'In Stock': 'secondary',
    'Out for Delivery': 'warning',
    'Delivered': 'success',
    'Failed/Returned': 'danger'
  };
  return <Badge bg={map[status] || 'secondary'}>{status}</Badge>;
}
