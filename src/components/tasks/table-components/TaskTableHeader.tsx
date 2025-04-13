
import React from "react";
import { Table, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const TaskTableHeader: React.FC = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Title</TableHead>
        <TableHead>Assigned To</TableHead>
        <TableHead>Department</TableHead>
        <TableHead>Due Date</TableHead>
        <TableHead>Priority</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Reminder</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default TaskTableHeader;
