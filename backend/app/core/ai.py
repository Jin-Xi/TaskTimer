"""
AI Service - Proxy for AI providers (DeepSeek, OpenAI, Google)
"""
import json
from typing import Optional

import httpx
from fastapi import HTTPException

from app.config import settings


class AIService:
    """AI service for productivity analysis and project planning"""

    def __init__(self):
        self.provider = settings.AI_PROVIDER
        self.api_key = settings.AI_API_KEY
        self.model = settings.AI_MODEL
        self.base_url = settings.AI_BASE_URL

        # Fallback configuration
        self.fallback_provider = settings.AI_FALLBACK_PROVIDER
        self.fallback_api_key = settings.AI_FALLBACK_API_KEY
        self.fallback_model = settings.AI_FALLBACK_MODEL

    def _get_client_config(self, provider: str, api_key: str) -> tuple[str, dict]:
        """Get API endpoint and headers for a provider"""
        if provider == "deepseek":
            base_url = self.base_url or "https://api.deepseek.com"
            return f"{base_url}/v1/chat/completions", {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            }
        elif provider == "openai":
            base_url = self.base_url or "https://api.openai.com"
            return f"{base_url}/v1/chat/completions", {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            }
        elif provider == "google":
            # Google Gemini API
            base_url = self.base_url or "https://generativelanguage.googleapis.com"
            return f"{base_url}/v1beta/models/{self.model}:generateContent", {
                "Content-Type": "application/json",
                "x-goog-api-key": api_key,
            }
        else:
            raise ValueError(f"Unknown AI provider: {provider}")

    async def _call_api(
        self,
        messages: list[dict],
        provider: Optional[str] = None,
        api_key: Optional[str] = None,
        model: Optional[str] = None
    ) -> str:
        """Make API call to AI provider"""
        use_provider = provider or self.provider
        use_api_key = api_key or self.api_key
        use_model = model or self.model

        if not use_api_key:
            raise HTTPException(
                status_code=503,
                detail="AI service not configured. Please contact administrator."
            )

        url, headers = self._get_client_config(use_provider, use_api_key)

        if use_provider == "google":
            # Google Gemini format
            payload = {
                "contents": [
                    {
                        "parts": [{"text": msg["content"]}]
                    }
                    for msg in messages
                ],
                "generationConfig": {
                    "temperature": 0.7,
                    "maxOutputTokens": 4096,
                }
            }
        else:
            # OpenAI/DeepSeek format
            payload = {
                "model": use_model,
                "messages": messages,
                "temperature": 0.7,
                "max_tokens": 4096,
            }

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, headers=headers, json=payload)

            if response.status_code != 200:
                # Try fallback if available
                if self.fallback_provider and self.fallback_api_key and not provider:
                    return await self._call_api(
                        messages,
                        provider=self.fallback_provider,
                        api_key=self.fallback_api_key,
                        model=self.fallback_model
                    )
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"AI API error: {response.text}"
                )

            data = response.json()

            if use_provider == "google":
                return data["candidates"][0]["content"]["parts"][0]["text"]
            else:
                return data["choices"][0]["message"]["content"]

    async def analyze_productivity(
        self,
        completed_tasks: list[dict]
    ) -> dict:
        """
        Analyze completed tasks and provide productivity insights

        Args:
            completed_tasks: List of completed task data (title, tags, duration)

        Returns:
            Dict with score, summary, and suggestions
        """
        if not completed_tasks:
            return {
                "score": 0,
                "summary": "No completed tasks to analyze.",
                "suggestions": ["Start completing tasks to get productivity insights!"],
                "analyzed_tasks": 0
            }

        # Prepare task summary for AI
        task_summary = []
        for task in completed_tasks:
            duration_minutes = (task.get("total_time", 0) // 60000)  # Convert ms to minutes
            task_summary.append({
                "title": task.get("title", "Untitled"),
                "tags": task.get("tags", []),
                "duration_minutes": duration_minutes,
            })

        system_prompt = """你是一个生产力分析专家。分析用户的任务完成情况，提供：
1. 生产力评分（0-100分）
2. 简短的工作总结（2-3句话）
3. 3-5条具体的改进建议

请以JSON格式返回结果：
{
    "score": <0-100的整数>,
    "summary": "<工作总结>",
    "suggestions": ["<建议1>", "<建议2>", ...]
}"""

        user_prompt = f"""请分析以下已完成的任务：

{json.dumps(task_summary, ensure_ascii=False, indent=2)}

请提供生产力分析和改进建议。"""

        try:
            response = await self._call_api([
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ])

            # Parse JSON response
            # Remove markdown code blocks if present
            response = response.strip()
            if response.startswith("```json"):
                response = response[7:]
            if response.startswith("```"):
                response = response[3:]
            if response.endswith("```"):
                response = response[:-3]
            response = response.strip()

            result = json.loads(response)
            result["analyzed_tasks"] = len(completed_tasks)
            return result

        except json.JSONDecodeError:
            # If AI doesn't return valid JSON, return a default response
            return {
                "score": 70,
                "summary": "Analysis completed but format error occurred.",
                "suggestions": ["Keep up the good work!", "Try to focus on one task at a time."],
                "analyzed_tasks": len(completed_tasks)
            }
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")

    async def generate_project_plan(
        self,
        goal: str,
        context: Optional[str] = None
    ) -> dict:
        """
        Generate a project plan with tasks based on a goal

        Args:
            goal: The user's goal or objective
            context: Additional context or constraints

        Returns:
            Dict with project name, description, and tasks
        """
        system_prompt = """你是一个项目规划专家。根据用户的目标，生成一个详细的项目计划。

请以JSON格式返回结果：
{
    "project_name": "<项目名称>",
    "project_description": "<项目描述>",
    "tasks": [
        {
            "title": "<任务标题>",
            "description": "<任务描述>",
            "estimated_time": <预计时间（分钟）>,
            "dependencies": ["<依赖的任务标题>"]
        }
    ],
    "total_estimated_time": <总预计时间（分钟）>
}

注意事项：
1. 将大目标分解为可执行的小任务
2. 任务应该有明确的完成标准
3. 合理估计每个任务的时间
4. 标注任务之间的依赖关系
5. 生成5-15个任务"""

        user_prompt = f"""请为以下目标生成项目计划：

目标：{goal}
"""
        if context:
            user_prompt += f"\n补充信息：{context}"

        try:
            response = await self._call_api([
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ])

            # Parse JSON response
            response = response.strip()
            if response.startswith("```json"):
                response = response[7:]
            if response.startswith("```"):
                response = response[3:]
            if response.endswith("```"):
                response = response[:-3]
            response = response.strip()

            return json.loads(response)

        except json.JSONDecodeError:
            raise HTTPException(
                status_code=500,
                detail="AI returned invalid JSON format"
            )
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"AI planning failed: {str(e)}")


# Global AI service instance
ai_service = AIService()
