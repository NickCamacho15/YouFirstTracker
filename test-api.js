// Test the Supabase REST API
import { createClient } from '@supabase/supabase-js';

// Get these from your Supabase dashboard
const SUPABASE_URL = 'https://jevviwdsnyvvtpnqbecm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impldnppd2RzbnlwdnRwbnFiZWNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODg1MTc1MjQsImV4cCI6MjAwNDA5MzUyNH0.5sCXnQMwxPnLYGrfvVIvBjvvO1OhADVgmyDZCpVFAMU'; // This is a public key, safe to include

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testApi() {
  try {
    console.log('Testing Supabase REST API...');
    
    // Try to get the server timestamp
    const { data, error } = await supabase.rpc('now');
    
    if (error) {
      console.error('API Error:', error);
    } else {
      console.log('API Success! Server time:', data);
    }
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testApi();
