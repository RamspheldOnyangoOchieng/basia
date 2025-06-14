"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon, CheckCircle, Copy, Database } from "lucide-react"

export default function DatabaseSetupPage() {
  const [copied, setCopied] = useState(false)

  const completeSetupSQL = `-- Step 1: Create generated_images table
CREATE TABLE IF NOT EXISTS generated_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  prompt TEXT NOT NULL,
  negative_prompt TEXT,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  width INTEGER,
  height INTEGER,
  steps INTEGER,
  seed BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create collections table
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Add collection_id and other fields to generated_images table
ALTER TABLE generated_images 
ADD COLUMN IF NOT EXISTS collection_id UUID REFERENCES collections(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS favorite BOOLEAN DEFAULT FALSE;

-- Step 4: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_generated_images_user_id ON generated_images(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_images_collection_id ON generated_images(collection_id);
CREATE INDEX IF NOT EXISTS idx_generated_images_favorite ON generated_images(favorite);

-- Step 5: Remove foreign key constraint if it's causing issues
ALTER TABLE generated_images DROP CONSTRAINT IF EXISTS generated_images_collection_id_fkey;
ALTER TABLE generated_images ADD CONSTRAINT generated_images_collection_id_fkey 
  FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE SET NULL;

-- Step 6: Enable Row Level Security on the tables
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

-- Step 7: Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can only see their own images" ON generated_images;
DROP POLICY IF EXISTS "Users can only insert their own images" ON generated_images;
DROP POLICY IF EXISTS "Users can only update their own images" ON generated_images;
DROP POLICY IF EXISTS "Users can only delete their own images" ON generated_images;
DROP POLICY IF EXISTS "Anonymous users can access their own images" ON generated_images;

DROP POLICY IF EXISTS "Users can only see their own collections" ON collections;
DROP POLICY IF EXISTS "Users can only insert their own collections" ON collections;
DROP POLICY IF EXISTS "Users can only update their own collections" ON collections;
DROP POLICY IF EXISTS "Users can only delete their own collections" ON collections;
DROP POLICY IF EXISTS "Anonymous users can access their own collections" ON collections;

-- Step 8: Create policies for generated_images
CREATE POLICY "Users can only see their own images"
ON generated_images FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can only insert their own images"
ON generated_images FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can only update their own images"
ON generated_images FOR UPDATE
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can only delete their own images"
ON generated_images FOR DELETE
USING (auth.uid() = user_id OR user_id IS NULL);

-- Step 9: Create policies for collections
CREATE POLICY "Users can only see their own collections"
ON collections FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can only insert their own collections"
ON collections FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can only update their own collections"
ON collections FOR UPDATE
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can only delete their own collections"
ON collections FOR DELETE
USING (auth.uid() = user_id OR user_id IS NULL);`

  const tablesOnlySQL = `-- Step 1: Create generated_images table
CREATE TABLE IF NOT EXISTS generated_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  prompt TEXT NOT NULL,
  negative_prompt TEXT,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  width INTEGER,
  height INTEGER,
  steps INTEGER,
  seed BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create collections table
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Add collection_id and other fields to generated_images table
ALTER TABLE generated_images 
ADD COLUMN IF NOT EXISTS collection_id UUID REFERENCES collections(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS favorite BOOLEAN DEFAULT FALSE;

-- Step 4: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_generated_images_user_id ON generated_images(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_images_collection_id ON generated_images(collection_id);
CREATE INDEX IF NOT EXISTS idx_generated_images_favorite ON generated_images(favorite);

-- Step 5: Remove foreign key constraint if it's causing issues
ALTER TABLE generated_images DROP CONSTRAINT IF EXISTS generated_images_collection_id_fkey;
ALTER TABLE generated_images ADD CONSTRAINT generated_images_collection_id_fkey 
  FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE SET NULL;`

  const rlsOnlySQL = `-- Step 1: Enable Row Level Security on the tables
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can only see their own images" ON generated_images;
DROP POLICY IF EXISTS "Users can only insert their own images" ON generated_images;
DROP POLICY IF EXISTS "Users can only update their own images" ON generated_images;
DROP POLICY IF EXISTS "Users can only delete their own images" ON generated_images;
DROP POLICY IF EXISTS "Anonymous users can access their own images" ON generated_images;

DROP POLICY IF EXISTS "Users can only see their own collections" ON collections;
DROP POLICY IF EXISTS "Users can only insert their own collections" ON collections;
DROP POLICY IF EXISTS "Users can only update their own collections" ON collections;
DROP POLICY IF EXISTS "Users can only delete their own collections" ON collections;
DROP POLICY IF EXISTS "Anonymous users can access their own collections" ON collections;

-- Step 3: Create policies for generated_images
CREATE POLICY "Users can only see their own images"
ON generated_images FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can only insert their own images"
ON generated_images FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can only update their own images"
ON generated_images FOR UPDATE
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can only delete their own images"
ON generated_images FOR DELETE
USING (auth.uid() = user_id OR user_id IS NULL);

-- Step 4: Create policies for collections
CREATE POLICY "Users can only see their own collections"
ON collections FOR SELECT
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can only insert their own collections"
ON collections FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can only update their own collections"
ON collections FOR UPDATE
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can only delete their own collections"
ON collections FOR DELETE
USING (auth.uid() = user_id OR user_id IS NULL);`

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Database className="h-8 w-8" />
        Database Setup
      </h1>

      <Alert className="mb-6">
        <InfoIcon className="h-4 w-4" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          Run these SQL scripts in your Supabase SQL Editor to set up the necessary tables and RLS policies. You can
          find the SQL Editor in your Supabase dashboard under SQL Editor.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="complete">
        <TabsList className="mb-4">
          <TabsTrigger value="complete">Complete Setup</TabsTrigger>
          <TabsTrigger value="tables">Tables Only</TabsTrigger>
          <TabsTrigger value="rls">RLS Policies Only</TabsTrigger>
        </TabsList>

        <TabsContent value="complete">
          <Card>
            <CardHeader>
              <CardTitle>Complete Database Setup</CardTitle>
              <CardDescription>
                This script creates all necessary tables and sets up Row Level Security policies.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea value={completeSetupSQL} readOnly className="font-mono text-sm h-[500px] overflow-auto" />
            </CardContent>
            <CardFooter>
              <Button onClick={() => copyToClipboard(completeSetupSQL)} className="w-full">
                {copied ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Copied to Clipboard
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy to Clipboard
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="tables">
          <Card>
            <CardHeader>
              <CardTitle>Tables Setup Only</CardTitle>
              <CardDescription>
                This script only creates the necessary tables without setting up RLS policies.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea value={tablesOnlySQL} readOnly className="font-mono text-sm h-[500px] overflow-auto" />
            </CardContent>
            <CardFooter>
              <Button onClick={() => copyToClipboard(tablesOnlySQL)} className="w-full">
                {copied ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Copied to Clipboard
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy to Clipboard
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="rls">
          <Card>
            <CardHeader>
              <CardTitle>RLS Policies Only</CardTitle>
              <CardDescription>
                This script only sets up Row Level Security policies for existing tables.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea value={rlsOnlySQL} readOnly className="font-mono text-sm h-[500px] overflow-auto" />
            </CardContent>
            <CardFooter>
              <Button onClick={() => copyToClipboard(rlsOnlySQL)} className="w-full">
                {copied ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Copied to Clipboard
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy to Clipboard
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Instructions</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>Go to your Supabase dashboard</li>
          <li>Click on "SQL Editor" in the left sidebar</li>
          <li>Create a "New Query"</li>
          <li>Paste the SQL script from above</li>
          <li>Click "Run" to execute the script</li>
          <li>Check for any errors in the output</li>
        </ol>
      </div>
    </div>
  )
}
