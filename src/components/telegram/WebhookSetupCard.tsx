
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTelegram } from "@/contexts/TelegramContext";

export const WebhookSetupCard = () => {
  const {
    config,
    webhookInfo,
    webhookStatus,
    webhookUrl,
    isUpdatingWebhook,
    showSecret,
    setWebhookUrl,
    setShowSecret,
    setWebhook,
    deleteWebhook
  } = useTelegram();

  // Get badge color based on webhook status
  const getStatusBadge = () => {
    switch (webhookStatus) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "inactive":
        return <Badge className="bg-yellow-500">Inactive</Badge>;
      case "error":
        return <Badge className="bg-red-500">Error</Badge>;
      case "loading":
        return <Badge className="bg-blue-500">Loading...</Badge>;
      default:
        return <Badge className="bg-gray-500">Unknown</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Webhook Configuration</span>
          {getStatusBadge()}
        </CardTitle>
        <CardDescription>
          Configure the webhook URL for your Telegram bot.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Current Webhook URL</h3>
            <div className="flex items-center gap-2">
              <Input 
                value={webhookUrl} 
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="Enter webhook URL"
                className="flex-1"
              />
              <Button onClick={setWebhook} disabled={isUpdatingWebhook}>
                {webhookStatus === "active" ? "Update" : "Set"}
              </Button>
              {webhookStatus === "active" && (
                <Button 
                  variant="destructive" 
                  onClick={deleteWebhook}
                  disabled={isUpdatingWebhook}
                >
                  Delete
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Use your project's Supabase edge function URL: 
              <code className="text-xs bg-muted px-1 py-0.5 rounded ml-1">
                https://klieshkrqryigtqtshka.supabase.co/functions/v1/telegram-webhook-proxy
              </code>
            </p>
          </div>

          {config && config.webhook_secret && (
            <div>
              <h3 className="text-sm font-medium mb-2">Webhook Secret</h3>
              <div className="flex items-center gap-2">
                <Input 
                  type={showSecret ? "text" : "password"} 
                  value={config.webhook_secret || ""}
                  readOnly
                  className="flex-1"
                />
                <Button 
                  variant="outline" 
                  onClick={() => setShowSecret(!showSecret)}
                  size="sm"
                >
                  {showSecret ? "Hide" : "Show"}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                This secret is automatically used when setting up the webhook.
              </p>
            </div>
          )}

          {webhookInfo && webhookStatus === "active" && (
            <div className="rounded border p-4 mt-4">
              <h3 className="text-sm font-medium mb-2">Webhook Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm">
                    <span className="font-medium">URL:</span> {webhookInfo.result?.url}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Pending Updates:</span> {webhookInfo.result?.pending_update_count}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Max Connections:</span> {webhookInfo.result?.max_connections}
                  </p>
                </div>
                <div>
                  <p className="text-sm">
                    <span className="font-medium">IP Address:</span> {webhookInfo.result?.ip_address}
                  </p>
                  {webhookInfo.result?.last_error_message && (
                    <p className="text-sm text-red-500">
                      <span className="font-medium">Last Error:</span> {webhookInfo.result?.last_error_message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
