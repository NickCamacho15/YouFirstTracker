import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit3, Save, X, Calculator, Target, Zap, Trophy, Plus, Trash2 } from "lucide-react";

interface PersonalRecord {
  exercise: string;
  weight: number;
  percentages: { [key: string]: number };
}

interface BodyMetrics {
  weight: number;
  bodyFat: number;
}

interface ProfileEditorProps {
  onSave: (data: { personalRecords: PersonalRecord[]; bodyMetrics: BodyMetrics }) => void;
  onCancel: () => void;
  initialData?: {
    personalRecords: PersonalRecord[];
    bodyMetrics: BodyMetrics;
  };
}

export default function ProfileEditor({ onSave, onCancel, initialData }: ProfileEditorProps) {
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>(
    initialData?.personalRecords || [
      { exercise: "Bench Press", weight: 225, percentages: {} },
      { exercise: "Squat", weight: 315, percentages: {} },
      { exercise: "Deadlift", weight: 405, percentages: {} },
      { exercise: "Overhead Press", weight: 135, percentages: {} },
    ]
  );

  const [bodyMetrics, setBodyMetrics] = useState<BodyMetrics>(
    initialData?.bodyMetrics || {
      weight: 185,
      bodyFat: 12.5,
    }
  );

  const [selectedExercise, setSelectedExercise] = useState<string>("");
  const [showPercentages, setShowPercentages] = useState<{ [key: string]: boolean }>({});

  // Calculate percentages for 1RM
  const calculatePercentages = (maxWeight: number): { [key: string]: number } => {
    const percentages: { [key: string]: number } = {};
    for (let i = 60; i <= 90; i += 5) {
      percentages[`${i}%`] = Math.round((maxWeight * i) / 100);
    }
    return percentages;
  };

  const handleRecordChange = (index: number, field: string, value: string) => {
    const newRecords = [...personalRecords];
    if (field === "weight") {
      const weight = parseInt(value) || 0;
      newRecords[index].weight = weight;
      newRecords[index].percentages = calculatePercentages(weight);
    } else {
      newRecords[index][field as keyof PersonalRecord] = value as never;
    }
    setPersonalRecords(newRecords);
  };

  const addNewRecord = () => {
    setPersonalRecords([...personalRecords, { exercise: "", weight: 0, percentages: {} }]);
  };

  const removeRecord = (index: number) => {
    const newRecords = personalRecords.filter((_, i) => i !== index);
    setPersonalRecords(newRecords);
  };

  const handleBodyMetricChange = (field: keyof BodyMetrics, value: string) => {
    setBodyMetrics(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0,
    }));
  };

  const togglePercentages = (exercise: string) => {
    setShowPercentages(prev => ({
      ...prev,
      [exercise]: !prev[exercise],
    }));
  };

  const handleSave = () => {
    onSave({ personalRecords, bodyMetrics });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">
          <Edit3 className="h-5 w-5 mr-2 text-blue-600" />
          Edit Profile
        </h2>
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onCancel}
            className="flex items-center space-x-1"
          >
            <X className="h-4 w-4" />
            <span>Cancel</span>
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-1"
          >
            <Save className="h-4 w-4" />
            <span>Save</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="records" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="records" className="flex items-center space-x-2">
            <Trophy className="h-4 w-4" />
            <span>Personal Records</span>
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center space-x-2">
            <Zap className="h-4 w-4" />
            <span>Body Metrics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="records" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center justify-between">
                <div className="flex items-center">
                  <Target className="h-4 w-4 mr-2 text-blue-600" />
                  1 Rep Max Records
                </div>
                <Button
                  size="sm"
                  onClick={addNewRecord}
                  className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-1"
                >
                  <Plus className="h-3 w-3" />
                  <span>Add</span>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {personalRecords.map((record, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-28">
                        <Label htmlFor={`exercise-${index}`} className="text-sm font-medium">
                          Exercise
                        </Label>
                        <Input
                          id={`exercise-${index}`}
                          value={record.exercise}
                          onChange={(e) => handleRecordChange(index, "exercise", e.target.value)}
                          className="mt-1 h-8"
                          placeholder="Exercise name"
                        />
                      </div>
                      <div className="w-16">
                        <Label htmlFor={`weight-${index}`} className="text-sm font-medium">
                          Max (lbs)
                        </Label>
                        <Input
                          id={`weight-${index}`}
                          type="number"
                          value={record.weight}
                          onChange={(e) => handleRecordChange(index, "weight", e.target.value)}
                          className="mt-1 h-8"
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => togglePercentages(record.exercise)}
                        className="h-8 px-2"
                      >
                        <span>%</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeRecord(index)}
                        className="h-8 px-2"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Percentage Calculator */}
                  {showPercentages[record.exercise] && (
                    <div className="ml-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="text-sm font-medium text-blue-900 mb-2">
                        Training Percentages for {record.exercise}
                      </h4>
                      <div className="grid grid-cols-4 gap-2">
                        {Object.entries(calculatePercentages(record.weight)).map(([percentage, weight]) => (
                          <div key={percentage} className="text-center">
                            <div className="text-xs text-blue-600 font-medium">{percentage}</div>
                            <div className="text-sm font-bold text-gray-900">{weight} lbs</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center">
                <Zap className="h-4 w-4 mr-2 text-blue-600" />
                Body Composition
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="weight" className="text-sm font-medium">
                    Weight (lbs)
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={bodyMetrics.weight}
                    onChange={(e) => handleBodyMetricChange("weight", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="bodyFat" className="text-sm font-medium">
                    Body Fat (%)
                  </Label>
                  <Input
                    id="bodyFat"
                    type="number"
                    step="0.1"
                    value={bodyMetrics.bodyFat}
                    onChange={(e) => handleBodyMetricChange("bodyFat", e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="pt-3 border-t">
                <div className="text-sm text-gray-600">
                  <strong>Calculated Values:</strong>
                  <div className="mt-1 space-y-1">
                    <div>Lean Mass: {(bodyMetrics.weight - (bodyMetrics.weight * bodyMetrics.bodyFat / 100)).toFixed(1)} lbs</div>
                    <div>Fat Mass: {(bodyMetrics.weight * bodyMetrics.bodyFat / 100).toFixed(1)} lbs</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}