CREATE TABLE "agent_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"thread_id" text NOT NULL,
	"cursor_agent_id" text NOT NULL,
	"branch_name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "agent_sessions_thread_id_unique" UNIQUE("thread_id")
);
