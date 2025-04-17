
import React, { useState, useEffect } from "react";
import { getTelegramConfig } from "@/services/telegramService";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const TelegramSetupCheck = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [telegramConfig, setTelegramConfig] = useState<any>(null);

  useEffect(() => {
    const checkTelegramConfig = async () => {
      const config = await getTelegramConfig();
      setTelegramConfig(config);
    };
    checkTelegramConfig();
  }, []);

  if (telegramConfig) return null;

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
        Configure Telegram Notifications
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Telegram Notifications Setup</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>Telegram notifications are not currently configured.</p>
          <p>Would you like to set up Telegram integration?</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TelegramSetupCheck;
