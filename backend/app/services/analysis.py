from typing import Dict, List
import openai
from datetime import datetime
import os

class StartupAnalyzer:
    def __init__(self):
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        openai.api_key = self.openai_api_key

    async def analyze_startup(self, startup_data: Dict) -> Dict:
        """
        Analyze startup data using OpenAI's GPT model to generate scores and insights.
        """
        # Prepare prompt for GPT analysis
        prompt = self._create_analysis_prompt(startup_data)
        
        try:
            response = await openai.ChatCompletion.acreate(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a startup analysis expert. Analyze the following startup data and provide detailed insights."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7
            )
            
            # Process and structure the GPT response
            analysis = self._process_gpt_response(response.choices[0].message.content)
            
            return {
                "market_score": analysis["scores"]["market"],
                "team_score": analysis["scores"]["team"],
                "tech_score": analysis["scores"]["tech"],
                "traction_score": analysis["scores"]["traction"],
                "overall_score": analysis["scores"]["overall"],
                "analysis_date": datetime.utcnow(),
                "insights": analysis["insights"],
                "risk_factors": analysis["risk_factors"]
            }
        except Exception as e:
            raise Exception(f"Error analyzing startup: {str(e)}")

    def _create_analysis_prompt(self, startup_data: Dict) -> str:
        """
        Create a detailed prompt for GPT analysis based on startup data.
        """
        return f"""
        Please analyze this startup and provide scores (0-10) and insights:

        Company: {startup_data['name']}
        Description: {startup_data['description']}
        Industry: {startup_data['industry']}
        Tech Stack: {', '.join(startup_data['tech_stack'])}
        Team Size: {startup_data['team_size']}
        Funding History: {startup_data['funding_history']}
        Location: {startup_data['location']}
        
        Founders:
        {self._format_founders(startup_data['founders'])}

        Please provide:
        1. Scores (0-10) for: Market Potential, Team Strength, Technical Capability, Traction, and Overall
        2. Key insights for each category
        3. Potential risk factors
        
        Format the response as a structured analysis.
        """

    def _format_founders(self, founders: List[Dict]) -> str:
        """
        Format founders' information for the prompt.
        """
        return "\n".join([
            f"- {founder['name']} ({founder['role']}): {founder['background']}"
            for founder in founders
        ])

    def _process_gpt_response(self, response: str) -> Dict:
        """
        Process and structure the GPT response into a standardized format.
        This is a simplified version - in production, you'd want more robust parsing.
        """
        # This is a placeholder - in production, you'd want to parse the GPT response
        # more carefully and handle various edge cases
        return {
            "scores": {
                "market": 7.5,
                "team": 8.0,
                "tech": 7.0,
                "traction": 6.5,
                "overall": 7.25
            },
            "insights": {
                "market": "Strong market potential with growing demand",
                "team": "Experienced founding team with relevant background",
                "tech": "Solid tech stack with modern technologies",
                "traction": "Early stage but showing promising growth"
            },
            "risk_factors": [
                "Early stage market with potential competitors",
                "Dependent on key partnerships",
                "Requires significant scaling of operations"
            ]
        }
