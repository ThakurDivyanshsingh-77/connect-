import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/landing/Footer"; 
import { useAuth } from "@/hooks/useAuth";
import { useMessages } from "@/hooks/useMessages";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area"; // Sidebar ke liye rakhein
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, MessageSquare, ArrowLeft, Loader2, Paperclip, Smile, Phone, Video, X, FileText } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { Link } from "react-router-dom";
import { API_URL } from "@/utils/config";
import EmojiPicker from "emoji-picker-react";
import axios from "axios"; 

export default function Messages() {
  const { user } = useAuth();
  const [selectedPartner, setSelectedPartner] = useState<{
    id: string;
    name: string;
    avatar: string | null;
  } | null>(null);

  const { conversations, loading: conversationsLoading, refreshConversations } = useMessages();
  const {
    messages,
    loading: messagesLoading,
    sendMessage,
    refreshMessages
  } = useMessages(selectedPartner?.id);

  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null); 
  
  // 👇 FIX 1: Ref ab Container par lagega (HTMLDivElement)
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedPartner) refreshMessages();
    refreshConversations();
  }, [selectedPartner]);

  // 👇 FIX 2: Better Auto Scroll Logic (Window scroll nahi karega)
  useEffect(() => {
    if (chatContainerRef.current) {
      const { scrollHeight, clientHeight } = chatContainerRef.current;
      // Sirf chat container ko bottom par set karein
      chatContainerRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: "smooth"
      });
    }
  }, [messages]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSend = async () => {
    if ((!newMessage.trim() && !selectedFile) || sending) return;
    
    setSending(true);
    setShowEmoji(false);

    let attachmentData = undefined;

    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const token = localStorage.getItem("token");
        
        // Ensure route is correct (no 's' in upload)
        const uploadRes = await axios.post(`${API_URL}/api/messages/upload`, formData, {
          headers: { 
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}` 
          }
        });

        attachmentData = {
          url: uploadRes.data.url,
          type: uploadRes.data.type
        };
      }

      const success = await sendMessage(newMessage.trim(), attachmentData);
      
      if (success) {
        setNewMessage("");
        setSelectedFile(null); 
        refreshConversations();
      }
    } catch (error) {
      console.error("Failed to send message", error);
    }
    
    setSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const onEmojiClick = (emojiObject: any) => {
    setNewMessage((prev) => prev + emojiObject.emoji);
  };

  const handleFileClick = () => {
    document.getElementById("fileInput")?.click();
  };

  const formatMessageTime = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isToday(date)) return format(date, "HH:mm");
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMM d");
  };

  const getAvatarUrl = (url: string | null) => {
    if (!url) return undefined;
    return url.startsWith("http") ? url : `${API_URL}/${url}`;
  };

  const getFileUrl = (path: string) => {
    return path.startsWith("http") ? path : `${API_URL}/${path}`;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center py-16">
            <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Sign in to view messages</h2>
            <Link to="/login"><Button>Sign In</Button></Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-24">
        <h1 className="text-3xl font-bold mb-6">Messages</h1>

        <Card className="h-[600px] overflow-hidden flex border-border/60 shadow-lg relative">
            {/* LEFT SIDEBAR (Uses ScrollArea - No Changes Needed Here) */}
            <div className={`w-full md:w-1/3 border-r bg-card ${selectedPartner ? "hidden md:block" : "block"}`}>
              <div className="p-4 border-b">
                <h2 className="font-semibold">Conversations</h2>
              </div>
              <ScrollArea className="h-[calc(600px-57px)]">
                {conversationsLoading ? (
                  <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
                ) : conversations.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-muted-foreground text-sm">No conversations yet</p>
                    <Link to="/network" className="text-primary text-xs hover:underline block mt-2">Find people to connect</Link>
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <button
                      key={conv.partnerId}
                      onClick={() => setSelectedPartner({ id: conv.partnerId, name: conv.partnerName, avatar: conv.partnerAvatar })}
                      className={`w-full p-4 flex items-center gap-3 hover:bg-accent/50 transition-colors border-b last:border-0 ${
                        selectedPartner?.id === conv.partnerId ? "bg-accent" : ""
                      }`}
                    >
                      <Avatar>
                        <AvatarImage src={getAvatarUrl(conv.partnerAvatar)} />
                        <AvatarFallback>{conv.partnerName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex justify-between items-center">
                          <span className="font-medium truncate">{conv.partnerName}</span>
                          <span className="text-xs text-muted-foreground">{formatMessageTime(conv.lastMessageTime)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {conv.unreadCount}
                        </span>
                      )}
                    </button>
                  ))
                )}
              </ScrollArea>
            </div>

            {/* RIGHT SIDE: Chat Area */}
            <div className={`flex-1 flex flex-col bg-background ${!selectedPartner ? "hidden md:flex" : "flex"}`}>
              {selectedPartner ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b flex items-center justify-between bg-card">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedPartner(null)}>
                        <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <Avatar>
                        <AvatarImage src={getAvatarUrl(selectedPartner.avatar)} />
                        <AvatarFallback>{selectedPartner.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <span className="font-semibold block">{selectedPartner.name}</span>
                            <span className="text-xs text-green-500">Online</span>
                        </div>
                    </div>
                    <div className="flex gap-1">
                        <Button variant="ghost" size="icon" title="Voice Call">
                            <Phone className="w-5 h-5 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Video Call">
                            <Video className="w-5 h-5 text-muted-foreground" />
                        </Button>
                    </div>
                  </div>

                  {/* 👇 FIX 3: Replaced ScrollArea with div (overflow-y-auto) for Perfect Scrolling */}
                  <div 
                    ref={chatContainerRef}
                    className="flex-1 p-4 bg-secondary/10 overflow-y-auto scroll-smooth"
                    onClick={() => setShowEmoji(false)}
                  >
                    {messagesLoading ? (
                      <div className="flex h-full items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
                    ) : messages.length === 0 ? (
                      <div className="flex h-full items-center justify-center text-muted-foreground">No messages yet. Say hello!</div>
                    ) : (
                      <div className="space-y-3">
                        {messages.map((msg) => {
                          const currentUserId = user?.id || (user as any)?._id;
                          const msgSenderId = typeof msg.sender === 'object' && msg.sender !== null ? (msg.sender as any)._id : msg.sender;
                          const isOwn = msgSenderId === currentUserId;

                          return (
                            <div key={msg._id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                              <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                                isOwn ? "bg-primary text-primary-foreground rounded-br-none" : "bg-card border rounded-bl-none"
                              }`}>
                                
                                {msg.attachment && msg.attachment.url && (
                                  <div className="mb-2">
                                    {msg.attachment.type && msg.attachment.type.startsWith("image/") ? (
                                      <img 
                                        src={getFileUrl(msg.attachment.url)} 
                                        alt="attachment" 
                                        className="rounded-lg max-w-full max-h-60 object-cover border border-white/20"
                                      />
                                    ) : (
                                      <div className="bg-black/10 p-2 rounded flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        <a 
                                          href={getFileUrl(msg.attachment.url)} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="underline truncate max-w-[150px] hover:text-white"
                                        >
                                          Download File
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {msg.content && <p className="break-words">{msg.content}</p>}

                                <p className={`text-[10px] mt-1 text-right opacity-70 ${isOwn ? "text-primary-foreground" : "text-muted-foreground"}`}>
                                  {formatMessageTime(msg.createdAt)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Input Area */}
                  <div className="p-4 border-t bg-card relative">
                    <input 
                      type="file" 
                      id="fileInput" 
                      className="hidden" 
                      onChange={handleFileSelect} 
                    />

                    {selectedFile && (
                        <div className="absolute -top-12 left-4 bg-background border p-2 rounded-md shadow-md flex items-center gap-2 text-xs animate-in slide-in-from-bottom-2">
                            <Paperclip className="h-3 w-3 text-muted-foreground" />
                            <span className="max-w-[200px] truncate font-medium">{selectedFile.name}</span>
                            <button 
                              onClick={() => setSelectedFile(null)} 
                              className="text-muted-foreground hover:text-destructive ml-2 p-1"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    )}

                    {showEmoji && (
                        <div className="absolute bottom-20 left-4 z-50 shadow-xl">
                            <EmojiPicker onEmojiClick={onEmojiClick} width={300} height={400} />
                        </div>
                    )}

                    <div className="flex gap-2 items-end">
                        <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground" onClick={handleFileClick}>
                                <Paperclip className="h-5 w-5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground" onClick={() => setShowEmoji(!showEmoji)}>
                                <Smile className="h-5 w-5" />
                            </Button>
                        </div>

                        <Input 
                            placeholder="Type a message..." 
                            value={newMessage} 
                            onChange={(e) => setNewMessage(e.target.value)} 
                            onKeyPress={handleKeyPress}
                            disabled={sending}
                            className="rounded-xl flex-1"
                        />
                        <Button 
                          onClick={handleSend} 
                          disabled={(!newMessage.trim() && !selectedFile) || sending} 
                          size="icon" 
                          className="rounded-full"
                        >
                            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground flex-col gap-4">
                  <MessageSquare className="h-16 w-16 opacity-20" />
                  <p>Select a conversation to start messaging</p>
                </div>
              )}
            </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
}