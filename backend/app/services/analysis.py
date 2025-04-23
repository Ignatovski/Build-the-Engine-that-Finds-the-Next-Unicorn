from typing import Dict, List
import openai
import os
from typing import Dict, List, Optional

class StartupAnalyzer:
    """Service for analyzing startup potential using AI and market data"""
    
    def __init__(self):
        """Initialize analyzer with OpenAI API key"""
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        if self.openai_api_key:
            openai.api_key = self.openai_api_key

    async def analyze_startup(self, startup_data: Dict[str, any]) -> Dict[str, any]:
        """Analyze startup data and return success predictions and insights"""
        if not startup_data.get('name'):
            return {"error": "Startup name is required"}

        try:
            # Use OpenAI if available, otherwise return mock analysis
            if self.openai_api_key:
                prompt = self._create_analysis_prompt(startup_data)
                response = await openai.ChatCompletion.acreate(
                    model="gpt-4",
                    messages=[
                        {"role": "system", "content": "You are a startup analysis expert. Analyze the startup data and provide detailed insights."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.7
                )
                return self._process_gpt_response(response.choices[0].message.content)
            else:
                return self._generate_mock_analysis(startup_data)

        except Exception as e:
            print(f"Error in startup analysis: {str(e)}")
            return self._generate_mock_analysis(startup_data)

    def _create_analysis_prompt(self, data: Dict[str, any]) -> str:
        """Create analysis prompt from startup data"""
        return f"""Analyze this startup:
            Name: {data.get('name')}
            Description: {data.get('description', 'N/A')}
            Industry: {data.get('industry', 'N/A')}
            Stage: {data.get('funding_stage', 'N/A')}
            
            Web Data: {data.get('web_data', {})}"""    

    def _generate_mock_analysis(self, data: Dict[str, any]) -> Dict[str, any]:
        """Generate mock analysis when OpenAI is not available"""
        return {
            "success_probability": 0.75,
            "unicorn_probability": 0.65,
            "strengths": [
                f"Strong presence in {data.get('industry', 'technology')} sector",
                "Innovative business model",
                "Experienced leadership team"
            ],
            "risks": [
                "Market competition",
                "Regulatory challenges",
                "Scaling challenges"
            ],
            "recommendations": [
                "Focus on market expansion",
                "Invest in technology development",
                "Build strategic partnerships"
            ]
        }

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
