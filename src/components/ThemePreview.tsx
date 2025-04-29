
import { useTheme } from "./ThemeProvider";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { 
  Sun, Moon, Laptop, 
  Volume2, Volume1, VolumeX, 
  MapPin, BarChart3, Settings
} from "lucide-react";

export const ThemePreview = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <Card className="p-6 border shadow-md w-full max-w-2xl mx-auto">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Theme Preview</h2>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant={theme === "light" ? "default" : "outline"}
              onClick={() => setTheme("light")}
            >
              <Sun className="h-4 w-4 mr-1" /> Light
            </Button>
            <Button 
              size="sm" 
              variant={theme === "dark" ? "default" : "outline"}
              onClick={() => setTheme("dark")}
            >
              <Moon className="h-4 w-4 mr-1" /> Dark
            </Button>
            <Button 
              size="sm" 
              variant={theme === "system" ? "default" : "outline"}
              onClick={() => setTheme("system")}
            >
              <Laptop className="h-4 w-4 mr-1" /> System
            </Button>
          </div>
        </div>

        <div className="text-center space-y-1">
          <div className="text-sm text-muted-foreground">
            Current theme: <span className="font-medium">{theme}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Resolved theme: <span className="font-medium">{resolvedTheme}</span>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Theme Samples</h3>
          
          <Tabs defaultValue="components">
            <TabsList>
              <TabsTrigger value="components">Components</TabsTrigger>
              <TabsTrigger value="colors">Colors</TabsTrigger>
            </TabsList>
            
            <TabsContent value="components" className="space-y-4 pt-4">
              <div className="flex flex-wrap gap-2">
                <Button variant="default">Default</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {/* Fix Badge props issue */}
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>

              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5 text-primary" />
                  <span className="font-medium">Noise level:</span>
                  <span className="text-green-500 dark:text-green-400">45 dB</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Volume1 className="h-5 w-5 text-primary" />
                  <span className="font-medium">Noise level:</span>
                  <span className="text-amber-500 dark:text-amber-400">65 dB</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <VolumeX className="h-5 w-5 text-primary" />
                  <span className="font-medium">Noise level:</span>
                  <span className="text-red-500 dark:text-red-400">85 dB</span>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="colors" className="pt-4">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {[
                  { name: "Background", class: "bg-background" },
                  { name: "Foreground", class: "bg-foreground text-background" },
                  { name: "Card", class: "bg-card" },
                  { name: "Card Foreground", class: "bg-card-foreground text-card" },
                  { name: "Primary", class: "bg-primary text-primary-foreground" },
                  { name: "Secondary", class: "bg-secondary text-secondary-foreground" },
                  { name: "Accent", class: "bg-accent text-accent-foreground" },
                  { name: "Muted", class: "bg-muted text-muted-foreground" },
                  { name: "Destructive", class: "bg-destructive text-destructive-foreground" }
                ].map((color) => (
                  <div 
                    key={color.name}
                    className={`p-4 rounded-md flex items-center justify-center h-16 ${color.class}`}
                  >
                    {color.name}
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Card>
  );
};

export default ThemePreview;
