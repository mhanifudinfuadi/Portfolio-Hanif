from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from emergentintegrations.llm.chat import LlmChat, UserMessage, TextDelta, StreamDone
import os
from typing import Optional

router = APIRouter(prefix="/ai", tags=["ai"])

# Load environment variable
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

class DescriptionRequest(BaseModel):
    project_title: str
    project_type: str  # "photography" or "writing"
    brief: Optional[str] = ""
    tone: Optional[str] = "professional"  # professional, creative, casual

@router.post("/generate-description")
async def generate_project_description(request: DescriptionRequest):
    """
    Generate AI-powered project description for portfolio items.
    Streams the response using GPT 6 Sol.
    """
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="AI service not configured")
    
    # Create system message based on project type
    if request.project_type == "photography":
        system_msg = """You are an expert photography curator and writer. 
        Write compelling, artistic descriptions for photography projects that capture the essence, 
        emotion, and technical excellence of the work. Use vivid, evocative language.
        Keep descriptions between 2-3 sentences, maximum 100 words."""
    else:  # writing/novel
        system_msg = """You are a literary critic and book reviewer. 
        Write engaging descriptions for written works and novels that intrigue readers 
        and capture the narrative essence. Use literary, sophisticated language.
        Keep descriptions between 2-3 sentences, maximum 100 words."""
    
    # Initialize LLM chat
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=f"desc_{request.project_title}",
        system_message=system_msg
    ).with_model("openai", "gpt-6-sol")
    
    # Create user prompt
    prompt = f"""Project Title: {request.project_title}
Type: {request.project_type}
{'Brief: ' + request.brief if request.brief else ''}

Write a {request.tone} description for this project."""
    
    user_message = UserMessage(text=prompt)
    
    # Stream the response
    async def event_generator():
        try:
            async for event in chat.stream_message(user_message):
                if isinstance(event, TextDelta):
                    yield f"data: {event.content}\n\n"
                elif isinstance(event, StreamDone):
                    yield "data: [DONE]\n\n"
                    break
        except Exception as e:
            yield f"data: [ERROR: {str(e)}]\n\n"
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive"
        }
    )

@router.post("/generate-batch")
async def generate_batch_descriptions(projects: list[DescriptionRequest]):
    """
    Generate descriptions for multiple projects.
    Returns array of generated descriptions.
    """
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="AI service not configured")
    
    results = []
    
    for project in projects:
        try:
            # System message
            if project.project_type == "photography":
                system_msg = "Write a 2-3 sentence artistic description for a photography project. Maximum 100 words."
            else:
                system_msg = "Write a 2-3 sentence literary description for a written work. Maximum 100 words."
            
            chat = LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id=f"batch_{project.project_title}",
                system_message=system_msg
            ).with_model("openai", "gpt-6-sol")
            
            prompt = f"Project: {project.project_title}\nType: {project.project_type}\n{project.brief if project.brief else ''}"
            description = ""
            
            async for event in chat.stream_message(UserMessage(text=prompt)):
                if isinstance(event, TextDelta):
                    description += event.content
                elif isinstance(event, StreamDone):
                    break
            
            results.append({
                "project_title": project.project_title,
                "description": description.strip(),
                "success": True
            })
        except Exception as e:
            results.append({
                "project_title": project.project_title,
                "error": str(e),
                "success": False
            })
    
    return {"results": results}
