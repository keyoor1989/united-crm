
import React from "react";
import { Star, Clock, Trophy, CheckCircle2 } from "lucide-react";

export const EngineerLeaderboard = () => {
  return (
    <div className="space-y-4">
      <div className="rounded-md border p-3 bg-gradient-to-r from-amber-50 to-amber-100">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold">
            1
          </div>
          <span className="font-medium">Vikram Singh</span>
          <Trophy className="h-4 w-4 text-amber-500 ml-auto" />
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-green-500" />
            <span>100% Completed</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-blue-500" />
            <span>2.9h Avg</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 text-amber-500" />
            <span>4.8 Rating</span>
          </div>
        </div>
      </div>

      <div className="rounded-md border p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold">
            2
          </div>
          <span className="font-medium">Ankit Patel</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-green-500" />
            <span>90% Completed</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-blue-500" />
            <span>3.2h Avg</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 text-amber-500" />
            <span>4.6 Rating</span>
          </div>
        </div>
      </div>

      <div className="rounded-md border p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-full bg-amber-200 flex items-center justify-center text-amber-800 font-bold">
            3
          </div>
          <span className="font-medium">Deepak Mishra</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-green-500" />
            <span>87% Completed</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-blue-500" />
            <span>3.4h Avg</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 text-amber-500" />
            <span>4.5 Rating</span>
          </div>
        </div>
      </div>
    </div>
  );
};
