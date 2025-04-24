
import { AlertTriangle, BookOpen, Check, ExternalLink, HelpCircle, Volume2, Headphones, MapPin, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center gap-2 mb-4 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
            <HelpCircle className="h-4 w-4" />
            <span>About NoiseSense</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Understanding Noise Pollution
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Learn about the impact of noise pollution on communities and how the NoiseSense app is helping to create quieter, healthier cities.
          </p>
        </div>
        
        {/* What is Noise Pollution */}
        <div className="mb-20">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-4">What is Noise Pollution?</h2>
              <p className="text-gray-700 mb-4">
                Noise pollution refers to unwanted or disturbing sounds that impact the health and well-being of humans and other organisms. Unlike other forms of pollution, noise pollution doesn't leave visible traces, making it an often overlooked environmental issue.
              </p>
              <p className="text-gray-700 mb-4">
                Sound is measured in decibels (dB), with normal conversation typically around 60 dB and a busy road ranging from 70-85 dB. Exposure to sounds above 85 dB for extended periods can cause hearing damage.
              </p>
              <div className="mt-6 bg-amber-50 border border-amber-100 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-amber-800 mb-1">Did you know?</h3>
                    <p className="text-amber-700 text-sm">
                      According to the World Health Organization, noise is the second largest environmental cause of health problems after air pollution.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:w-1/2">
              <Card className="overflow-hidden bg-white border-gray-200 shadow-md">
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Common Noise Levels</h3>
                  <div className="space-y-4">
                    {[
                      { source: "Whisper", level: "30 dB", color: "bg-green-500" },
                      { source: "Normal conversation", level: "60 dB", color: "bg-green-500" },
                      { source: "City traffic (inside car)", level: "80-85 dB", color: "bg-yellow-500" },
                      { source: "Motorcycle", level: "95 dB", color: "bg-yellow-500" },
                      { source: "Construction site", level: "100-110 dB", color: "bg-red-500" },
                      { source: "Rock concert", level: "110-120 dB", color: "bg-red-500" },
                      { source: "Jet engine (nearby)", level: "140 dB", color: "bg-red-500" },
                    ].map(item => (
                      <div key={item.source} className="flex items-center gap-3">
                        <div className={`h-3 w-3 rounded-full ${item.color}`}></div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <span>{item.source}</span>
                            <span className="font-medium">{item.level}</span>
                          </div>
                          <div className="h-1 bg-gray-100 rounded-full mt-1">
                            <div 
                              className={`h-full rounded-full ${item.color}`} 
                              style={{ width: `${Math.min(100, parseInt(item.level))}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
        
        {/* Health Impacts */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold mb-8 text-center">Health Impacts of Noise Pollution</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 border-gray-200 shadow-md bg-gradient-to-b from-white to-gray-50">
              <div className="bg-red-100 p-3 rounded-full w-fit mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Physical Health</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                  <span>Hearing loss and tinnitus</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                  <span>Increased blood pressure</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                  <span>Cardiovascular problems</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                  <span>Weakened immune system</span>
                </li>
              </ul>
            </Card>
            
            <Card className="p-6 border-gray-200 shadow-md bg-gradient-to-b from-white to-gray-50">
              <div className="bg-amber-100 p-3 rounded-full w-fit mb-4">
                <BookOpen className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Mental Health</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                  <span>Stress and anxiety</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                  <span>Sleep disturbances</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                  <span>Decreased cognitive performance</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                  <span>Irritability and mood disorders</span>
                </li>
              </ul>
            </Card>
            
            <Card className="p-6 border-gray-200 shadow-md bg-gradient-to-b from-white to-gray-50">
              <div className="bg-blue-100 p-3 rounded-full w-fit mb-4">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Social Impact</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                  <span>Decreased property values</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                  <span>Reduced productivity</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                  <span>Negative impact on education</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                  <span>Communication difficulties</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
        
        {/* About NoiseSense */}
        <div className="mb-20">
          <div className="flex flex-col md:flex-row-reverse gap-8 items-center">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-4">About Our Project</h2>
              <p className="text-gray-700 mb-4">
                NoiseSense is a citizen science project that empowers the people of Pune to monitor and map noise pollution levels across the city. By leveraging the power of smartphones and crowdsourced data collection, we're creating a comprehensive picture of urban noise pollution.
              </p>
              <p className="text-gray-700 mb-4">
                Our goal is to provide valuable data to city planners, researchers, and policymakers to support evidence-based decisions that can create a quieter and healthier urban environment.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <Button asChild className="bg-purple-600 hover:bg-purple-700">
                  <Link to="/">Start Contributing</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/map">View Noise Map</Link>
                </Button>
              </div>
            </div>
            <div className="md:w-1/2">
              <Card className="p-6 border-gray-200 shadow-md bg-gradient-to-b from-white to-gray-50">
                <h3 className="text-xl font-semibold mb-4">How NoiseSense Works</h3>
                <ol className="space-y-6">
                  <li className="flex gap-4">
                    <div className="bg-purple-100 text-purple-700 h-8 w-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
                    <div>
                      <h4 className="font-medium mb-1">Measure</h4>
                      <p className="text-gray-600 text-sm">
                        Use your smartphone to record and analyze ambient noise levels in your surroundings with our app's automated decibel measurement tool.
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <div className="bg-purple-100 text-purple-700 h-8 w-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
                    <div>
                      <h4 className="font-medium mb-1">Categorize</h4>
                      <p className="text-gray-600 text-sm">
                        Identify the source of the noise (traffic, construction, etc.) and add optional notes to provide context about the noise pollution.
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <div className="bg-purple-100 text-purple-700 h-8 w-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
                    <div>
                      <h4 className="font-medium mb-1">Map</h4>
                      <p className="text-gray-600 text-sm">
                        Your anonymized data is added to our citywide database and visualized on interactive maps showing noise pollution patterns.
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <div className="bg-purple-100 text-purple-700 h-8 w-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">4</div>
                    <div>
                      <h4 className="font-medium mb-1">Analyze</h4>
                      <p className="text-gray-600 text-sm">
                        We analyze the collective data to identify hotspots, patterns, and trends in noise pollution across different areas and times.
                      </p>
                    </div>
                  </li>
                </ol>
              </Card>
            </div>
          </div>
        </div>
        
        {/* Noise Regulations */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold mb-6 text-center">Noise Regulations in India</h2>
          <p className="text-gray-700 text-center mb-8 max-w-3xl mx-auto">
            The Noise Pollution (Regulation and Control) Rules, 2000 under the Environment Protection Act, 1986, establish standards for ambient noise levels in different areas.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-6 py-3 text-left">Area Code</th>
                  <th className="border border-gray-300 px-6 py-3 text-left">Category of Area</th>
                  <th className="border border-gray-300 px-6 py-3 text-left">Day Limits (6am-10pm)</th>
                  <th className="border border-gray-300 px-6 py-3 text-left">Night Limits (10pm-6am)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white hover:bg-gray-50">
                  <td className="border border-gray-300 px-6 py-3">A</td>
                  <td className="border border-gray-300 px-6 py-3">Industrial area</td>
                  <td className="border border-gray-300 px-6 py-3">75 dB</td>
                  <td className="border border-gray-300 px-6 py-3">70 dB</td>
                </tr>
                <tr className="bg-white hover:bg-gray-50">
                  <td className="border border-gray-300 px-6 py-3">B</td>
                  <td className="border border-gray-300 px-6 py-3">Commercial area</td>
                  <td className="border border-gray-300 px-6 py-3">65 dB</td>
                  <td className="border border-gray-300 px-6 py-3">55 dB</td>
                </tr>
                <tr className="bg-white hover:bg-gray-50">
                  <td className="border border-gray-300 px-6 py-3">C</td>
                  <td className="border border-gray-300 px-6 py-3">Residential area</td>
                  <td className="border border-gray-300 px-6 py-3">55 dB</td>
                  <td className="border border-gray-300 px-6 py-3">45 dB</td>
                </tr>
                <tr className="bg-white hover:bg-gray-50">
                  <td className="border border-gray-300 px-6 py-3">D</td>
                  <td className="border border-gray-300 px-6 py-3">Silence zone</td>
                  <td className="border border-gray-300 px-6 py-3">50 dB</td>
                  <td className="border border-gray-300 px-6 py-3">40 dB</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-6 text-gray-600 text-sm text-center">
            <p>Note: Silence zones include areas around hospitals, educational institutions, courts, and religious places.</p>
          </div>
        </div>
        
        {/* Resources */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Additional Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 border-gray-200 shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3">Research & Studies</h3>
              <ul className="space-y-3">
                <li>
                  <a 
                    href="https://www.who.int/europe/news-room/fact-sheets/item/noise" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-start gap-2 group"
                  >
                    <ExternalLink className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0 group-hover:text-blue-800" />
                    <span className="text-blue-600 hover:text-blue-800 hover:underline">World Health Organization - Noise Facts and Guidelines</span>
                  </a>
                </li>
                <li>
                  <a 
                    href="https://cpcb.nic.in/noise-pollution/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-start gap-2 group"
                  >
                    <ExternalLink className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0 group-hover:text-blue-800" />
                    <span className="text-blue-600 hover:text-blue-800 hover:underline">Central Pollution Control Board - Noise Pollution</span>
                  </a>
                </li>
                <li>
                  <a 
                    href="https://pubmed.ncbi.nlm.nih.gov/30483395/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-start gap-2 group"
                  >
                    <ExternalLink className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0 group-hover:text-blue-800" />
                    <span className="text-blue-600 hover:text-blue-800 hover:underline">Environmental Noise and Health - National Library of Medicine</span>
                  </a>
                </li>
              </ul>
            </Card>
            
            <Card className="p-6 border-gray-200 shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold mb-3">Take Action</h3>
              <ul className="space-y-3">
                <li>
                  <a 
                    href="https://www.pmc.gov.in" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-start gap-2 group"
                  >
                    <ExternalLink className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0 group-hover:text-blue-800" />
                    <span className="text-blue-600 hover:text-blue-800 hover:underline">Pune Municipal Corporation - Report Noise Violations</span>
                  </a>
                </li>
                <li>
                  <a 
                    href="https://www.mpcb.gov.in" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-start gap-2 group"
                  >
                    <ExternalLink className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0 group-hover:text-blue-800" />
                    <span className="text-blue-600 hover:text-blue-800 hover:underline">Maharashtra Pollution Control Board</span>
                  </a>
                </li>
                <li>
                  <a 
                    href="https://noisepollution.gov.in/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-start gap-2 group"
                  >
                    <ExternalLink className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0 group-hover:text-blue-800" />
                    <span className="text-blue-600 hover:text-blue-800 hover:underline">National Noise Monitoring Network</span>
                  </a>
                </li>
              </ul>
            </Card>
          </div>
        </div>
        
        <div className="flex justify-center mt-16">
          <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700">
            <Link to="/">Record & Report Noise</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default About;
