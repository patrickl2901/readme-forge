export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      readmes: {
        Row: {
          id: string
          user_id: string
          repo_url: string
          repo_name: string
          generated_markdown: string
          template: string
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          repo_url: string
          repo_name: string
          generated_markdown: string
          template: string
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          repo_url?: string
          repo_name?: string
          generated_markdown?: string
          template?: string
          metadata?: Json
          created_at?: string
        }
      }
    }
  }
}

export type ReadmeRecord = Database['public']['Tables']['readmes']['Row']
export type ReadmeInsert = Database['public']['Tables']['readmes']['Insert']
