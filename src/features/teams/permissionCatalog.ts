export const PERMISSION_OPTIONS: { id: string; label: string }[] = [
  { id: 'view_inventory', label: 'View inventory' },
  { id: 'create_transaction', label: 'Create transactions' },
  { id: 'edit_transaction', label: 'Edit transactions' },
  { id: 'delete_transaction', label: 'Delete transactions' },
  { id: 'export_data', label: 'Export data' },
  { id: 'view_reports', label: 'View reports' },
  { id: 'manage_users', label: 'Manage users & teams' },
  { id: 'view_audit_logs', label: 'View audit logs' },
  { id: 'manage_settings', label: 'Manage settings' },
  { id: 'view_compliance', label: 'View compliance' },
  { id: 'approve_transaction', label: 'Approve transactions (workflow)' }
];

export const TRANSACTION_TYPE_OPTIONS = [
  { id: 'sale', label: 'Sales' },
  { id: 'payment', label: 'Payments' },
  { id: 'restock', label: 'Restock / inventory' },
  { id: 'expense', label: 'Expenses' },
  { id: 'purchase_order', label: 'Purchase orders' },
  { id: 'ledger', label: 'Ledger entries' }
];
