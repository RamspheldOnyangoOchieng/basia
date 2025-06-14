-- Create payments table for storing transaction data
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  stripe_customer_id TEXT,
  amount DECIMAL(10, 2),
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL,
  payment_method TEXT,
  payment_method_details JSONB,
  billing_details JSONB,
  subscription_id TEXT,
  plan_id UUID REFERENCES subscription_plans(id),
  plan_name TEXT,
  plan_duration INTEGER,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS payments_user_id_idx ON payments (user_id);
CREATE INDEX IF NOT EXISTS payments_created_at_idx ON payments (created_at DESC);
CREATE INDEX IF NOT EXISTS payments_status_idx ON payments (status);
CREATE INDEX IF NOT EXISTS payments_stripe_session_id_idx ON payments (stripe_session_id);
CREATE INDEX IF NOT EXISTS payments_stripe_payment_intent_id_idx ON payments (stripe_payment_intent_id);

-- Enable Row Level Security
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own payments
CREATE POLICY "Users can view their own payments" 
  ON payments FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy for admins to view all payments
CREATE POLICY "Admins can view all payments" 
  ON payments FOR SELECT 
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE auth.users.email IN (
      SELECT email FROM admin_users
    )
  ));

-- Create policy for server-side functions to insert payments
CREATE POLICY "Server can insert payments" 
  ON payments FOR INSERT 
  WITH CHECK (true);

-- Create policy for server-side functions to update payments
CREATE POLICY "Server can update payments" 
  ON payments FOR UPDATE 
  USING (true);
