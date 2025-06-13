
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { AlertTriangle, MessageSquare, Send, Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const AIConsultation = () => {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!hasAcceptedDisclaimer) {
      toast({
        title: "Please accept the disclaimer",
        description: "You must read and accept the health disclaimer before proceeding.",
        variant: "destructive",
      });
      return;
    }

    if (!question.trim()) {
      toast({
        title: "Please enter your question",
        description: "Please describe your health concern or question.",
        variant: "destructive",
      });
      return;
    }

    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your OpenAI API key to use the AI consultation feature.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const healthPrompt = `You are a knowledgeable AI assistant providing general gynecological and women's health information. 

IMPORTANT DISCLAIMERS:
- This is for educational and informational purposes only
- This is NOT a substitute for professional medical advice
- Always recommend consulting with a healthcare provider
- Do not provide specific diagnoses
- Focus on general health information and when to seek medical care

User's question: ${question}

Please provide helpful, accurate general information while emphasizing the importance of professional medical consultation for any health concerns.`;

      const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4.1-2025-04-14',
          messages: [
            {
              role: 'system',
              content: healthPrompt
            }
          ],
          max_tokens: 800,
          temperature: 0.3,
        }),
      });

      if (!openAIResponse.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await openAIResponse.json();
      const aiResponse = data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
      
      const responseWithDisclaimer = `${aiResponse}

⚠️ **IMPORTANT MEDICAL DISCLAIMER:**
This information is for educational purposes only and is not intended to replace professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of something you have read here. If you think you may have a medical emergency, call your doctor or emergency services immediately.`;

      setResponse(responseWithDisclaimer);
      
      toast({
        title: "AI Response Generated",
        description: "Please remember this is for informational purposes only.",
      });
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please check your API key and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-100 to-purple-100 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Bot className="w-5 h-5" />
            AI Health Consultation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-600 text-sm">
            Get general information about women's health and gynecological concerns. This is for educational purposes only.
          </p>
        </CardContent>
      </Card>

      {/* Legal Disclaimer */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-700 text-lg">
            <AlertTriangle className="w-5 h-5" />
            Important Medical Disclaimer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-orange-800 space-y-2">
            <p><strong>READ CAREFULLY BEFORE PROCEEDING:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>This AI consultation is for <strong>informational and educational purposes ONLY</strong></li>
              <li>This is <strong>NOT a substitute</strong> for professional medical advice, diagnosis, or treatment</li>
              <li>Always consult with qualified healthcare providers for any health concerns</li>
              <li>Do not disregard professional medical advice based on information provided here</li>
              <li>In case of medical emergency, contact emergency services immediately</li>
              <li>We take <strong>NO RESPONSIBILITY</strong> for any consequences of using this information</li>
            </ul>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="disclaimer"
              checked={hasAcceptedDisclaimer}
              onChange={(e) => setHasAcceptedDisclaimer(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="disclaimer" className="text-sm font-medium text-orange-800">
              I understand and accept the above disclaimers
            </label>
          </div>
        </CardContent>
      </Card>

      {/* API Key Input */}
      <Card>
        <CardHeader>
          <CardTitle className="text-purple-700">API Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <label className="text-sm font-medium">OpenAI API Key</label>
            <Input
              type="password"
              placeholder="Enter your OpenAI API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              Your API key is stored locally and used only for this session. Get your API key from{" "}
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                OpenAI Platform
              </a>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Question Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-700">
            <MessageSquare className="w-5 h-5" />
            Your Health Question
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Describe your concern or question:</label>
            <Textarea
              placeholder="E.g., I'm experiencing irregular periods and wondering about possible causes..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={4}
              disabled={!hasAcceptedDisclaimer}
            />
          </div>
          <Button 
            onClick={handleSubmit}
            disabled={isLoading || !hasAcceptedDisclaimer || !question.trim() || !apiKey.trim()}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            {isLoading ? (
              "Getting AI Response..."
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Get AI Consultation
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* AI Response */}
      {response && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Bot className="w-5 h-5" />
              AI Response
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">
                {response}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Resources */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader>
          <CardTitle className="text-green-700">When to Seek Professional Help</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-green-800 space-y-2">
            <p><strong>Consult a healthcare provider immediately if you experience:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Severe abdominal or pelvic pain</li>
              <li>Heavy bleeding or unusual discharge</li>
              <li>Persistent symptoms that concern you</li>
              <li>Any sudden changes in your menstrual cycle</li>
              <li>Symptoms affecting your daily life</li>
            </ul>
            <p className="mt-3">
              <strong>Remember:</strong> Regular gynecological check-ups are important for maintaining good reproductive health.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
