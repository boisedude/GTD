"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Inbox,
  Target,
  FolderOpen,
  Clock,
  Star,
  CheckCircle,
  ArrowRight,
  Settings,
} from "lucide-react";

// Mock captured items for demonstration
const mockCapturedItems = [
  { id: 1, text: "Call dentist for appointment", status: "captured" },
  { id: 2, text: "Research project management tools", status: "captured" },
  { id: 3, text: "Buy groceries for dinner party", status: "captured" },
  { id: 4, text: "Plan quarterly team review", status: "captured" },
  { id: 5, text: "Fix leaky faucet in kitchen", status: "captured" },
];

const organizationOptions = [
  {
    type: "next_action",
    label: "Next Action",
    description: "Something you can do right now",
    icon: Target,
    color: "bg-brand-teal-light text-brand-teal-dark",
  },
  {
    type: "project",
    label: "Project",
    description: "Requires multiple steps",
    icon: FolderOpen,
    color: "bg-purple-100 text-purple-800",
  },
  {
    type: "waiting_for",
    label: "Waiting For",
    description: "Waiting on someone else",
    icon: Clock,
    color: "bg-warning-light text-warning-dark",
  },
  {
    type: "someday",
    label: "Someday/Maybe",
    description: "Not urgent, future consideration",
    icon: Star,
    color: "bg-brand-gray-100 text-brand-gray-700",
  },
];

export default function OrganizePage() {
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [organizedItems, setOrganizedItems] = useState<{
    [key: number]: string;
  }>({});

  const handleOrganize = (itemId: number, type: string) => {
    setOrganizedItems((prev) => ({ ...prev, [itemId]: type }));
    setSelectedItem(null);
  };

  const unorganizedItems = mockCapturedItems.filter(
    (item) => !organizedItems[item.id]
  );
  const organizedCount = Object.keys(organizedItems).length;

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-navy mb-2">
          Organize & Clarify
        </h1>
        <p className="text-brand-gray-600">
          Transform captured items into actionable tasks and projects.
        </p>

        {/* Progress indicator */}
        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Inbox className="h-4 w-4 text-brand-gray-500" />
            <span className="text-sm text-brand-gray-600">
              {unorganizedItems.length} items to organize
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-success-dark" />
            <span className="text-sm text-brand-gray-600">
              {organizedCount} organized
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inbox - Items to Organize */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Inbox className="h-5 w-5 text-brand-teal" />
                Captured Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              {unorganizedItems.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-success-dark mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-brand-navy mb-2">
                    All Done!
                  </h3>
                  <p className="text-brand-gray-600">
                    You&apos;ve organized all your captured items. Great work!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {unorganizedItems.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedItem === item.id
                          ? "border-brand-teal bg-brand-teal-light"
                          : "border-brand-gray-200 hover:border-brand-gray-300"
                      }`}
                      onClick={() => setSelectedItem(item.id)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-brand-navy">{item.text}</span>
                        <Badge variant="captured">{item.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Organization Question */}
          {selectedItem && (
            <Card className="mt-4 border-brand-teal">
              <CardHeader>
                <CardTitle className="text-lg">What is this item?</CardTitle>
                <p className="text-sm text-brand-gray-600">
                  &quot;
                  {mockCapturedItems.find((i) => i.id === selectedItem)?.text}
                  &quot;
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {organizationOptions.map((option) => (
                    <Button
                      key={option.type}
                      variant="outline"
                      className="h-auto p-4 text-left justify-start"
                      onClick={() => handleOrganize(selectedItem, option.type)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${option.color}`}>
                          <option.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-brand-gray-500">
                            {option.description}
                          </div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Organization Guide */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-brand-teal" />
                Organization Guide
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-brand-navy mb-2">
                  Ask yourself:
                </h4>
                <ul className="text-sm text-brand-gray-600 space-y-2">
                  <li>• Is this actionable?</li>
                  <li>• Can I do this in one step?</li>
                  <li>• Do I need to wait for someone?</li>
                  <li>• Is this urgent or important?</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-brand-navy mb-2">
                  Decision Tree:
                </h4>
                <div className="text-xs text-brand-gray-600 space-y-1">
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-3 w-3" />
                    <span>Single action → Next Action</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-3 w-3" />
                    <span>Multiple steps → Project</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-3 w-3" />
                    <span>Need others → Waiting For</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowRight className="h-3 w-3" />
                    <span>Not urgent → Someday/Maybe</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-lg">Today&apos;s Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Items Organized:</span>
                  <span className="font-semibold">{organizedCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Remaining:</span>
                  <span className="font-semibold">
                    {unorganizedItems.length}
                  </span>
                </div>
                <div className="w-full bg-brand-gray-200 rounded-full h-2">
                  <div
                    className="bg-brand-teal h-2 rounded-full transition-all"
                    style={{
                      width: `${(organizedCount / mockCapturedItems.length) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
