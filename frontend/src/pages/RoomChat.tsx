import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/landing/Footer"; 
import { useAuth } from "@/hooks/useAuth";
import { useRoomChat } from "@/hooks/useRoomChat";
import { useNetwork } from "@/hooks/useNetwork";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Send, MessageSquare, ArrowLeft, Loader2, Paperclip, Smile, Users, X, FileText, Pin, Megaphone, UserPlus, Search } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { API_URL } from "@/utils/config";
import EmojiPicker from "emoji-picker-react";
import axios from "axios"; 

export default function RoomChat() {
  const { roomId } = useParams<{ roomId: string }>();
  const { user, role } = useAuth();
  const currentUserId = user?.id || (user as any)?._id;

  const { messages, loading, roomDetails, sendMessage, togglePin, toggleReaction, inviteMember } = useRoomChat(roomId || "");
  const { users } = useNetwork();

  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null); 
  const [showSidebar, setShowSidebar] = useState(false);
  const [isAnnouncement, setIsAnnouncement] = useState(false);
  
  const [inviteSearch, setInviteSearch] = useState("");
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const isAdmin = roomDetails?.admins?.some((a: any) => a._id === currentUserId) || roomDetails?.createdBy === currentUserId || role === 'admin';
  const pinnedMessage = messages.find(m => m.isPinned);

  const availableUsersToInvite = users?.filter(u => 
    !roomDetails?.members?.some((m: any) => m._id === u.id) &&
    (u.full_name || "").toLowerCase().includes(inviteSearch.toLowerCase())
  ) || [];

  const handleInvite = async (targetId: string) => {
    await inviteMember(targetId);
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      const { scrollHeight, clientHeight } = chatContainerRef.current;
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
    let type = isAnnouncement ? "announcement" : "text";

    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const token = localStorage.getItem("token");
        const uploadRes = await axios.post(`${API_URL}/api/messages/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` }
        });
        attachmentData = { url: uploadRes.data.url, type: uploadRes.data.type };
        if (!isAnnouncement) {
           type = uploadRes.data.type.startsWith("image/") ? "image" : "file";
        }
      }

      const success = await sendMessage(newMessage.trim(), attachmentData, type);
      if (success) {
        setNewMessage("");
        setSelectedFile(null); 
        setIsAnnouncement(false);
      }
    } catch (error) {
      console.error("Send error", error);
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

  const formatMessageTime = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isToday(date)) return format(date, "HH:mm");
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMM d");
  };

  const getAvatarUrl = (url?: string | null) => {
    if (!url) return undefined;
    return url;
  };

  const getFileUrl = (path: string) => {
    return path;
  };

  if (!roomId) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 md:py-16 max-w-6xl">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/community">
            <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{roomDetails?.name || "Loading Room..."}</h1>
            {roomDetails && <p className="text-sm text-muted-foreground">{roomDetails.members?.length} members</p>}
          </div>
        </div>

        <Card className="h-[600px] overflow-hidden flex border-border/60 shadow-lg relative">
            <div className={`flex-1 flex flex-col bg-background relative ${showSidebar ? "hidden md:flex" : "flex"}`}>
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center justify-between bg-card z-20">
                <div className="flex items-center gap-3">
                  <div>
                    <span className="font-semibold block">{roomDetails?.name}</span>
                    <span className="text-xs text-muted-foreground capitalize">{roomDetails?.type} Room</span>
                  </div>
                </div>
                <div className="flex gap-1 md:hidden">
                    <Button variant="ghost" size="icon" onClick={() => setShowSidebar(true)}>
                        <Users className="w-5 h-5 text-muted-foreground" />
                    </Button>
                </div>
              </div>

              {/* Pinned Message Banner */}
              {pinnedMessage && (
                <div className="bg-primary/5 border-b px-4 py-2.5 flex items-center justify-between text-sm shadow-sm z-10 transition-all">
                   <div className="flex items-center gap-3 overflow-hidden">
                     <div className="bg-primary text-primary-foreground p-1 rounded-full shrink-0">
                       <Pin className="h-3 w-3" />
                     </div>
                     <span className="font-semibold text-primary shrink-0 hidden sm:inline">Pinned:</span>
                     <span className="truncate text-muted-foreground max-w-[200px] md:max-w-md">{pinnedMessage.content || "Attachment"}</span>
                   </div>
                   {isAdmin && (
                     <Button variant="ghost" size="sm" className="h-7 w-7 p-0 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => togglePin(pinnedMessage._id)}>
                       <X className="h-4 w-4" />
                     </Button>
                   )}
                </div>
              )}

              <div 
                ref={chatContainerRef}
                className="flex-1 p-4 bg-secondary/10 overflow-y-auto scroll-smooth"
                onClick={() => setShowEmoji(false)}
              >
                {loading && messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mb-2 opacity-20" />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {messages.map((msg, index) => {
                      const msgSenderId = typeof msg.sender === 'object' && msg.sender !== null ? (msg.sender as any)._id : msg.sender;
                      const msgSenderName = typeof msg.sender === 'object' && msg.sender !== null ? (msg.sender as any).name : "User";
                      const msgSenderAvatar = typeof msg.sender === 'object' && msg.sender !== null ? (msg.sender as any).avatar_url : null;
                      const isOwn = msgSenderId === currentUserId;
                      const isAnnouncement = msg.messageType === "announcement";
                      
                      const showHeader = index === 0 || 
                        (typeof messages[index - 1].sender === 'object' ? (messages[index - 1].sender as any)._id : messages[index - 1].sender) !== msgSenderId;

                      return (
                        <div key={msg._id} className={`flex gap-3 relative group ${isOwn ? "justify-end" : "justify-start"} ${isAnnouncement ? "px-2" : ""}`}>
                          {!isOwn && !isAnnouncement && (
                            <Avatar className="h-8 w-8 mt-auto hidden md:block shrink-0">
                              <AvatarImage src={getAvatarUrl(msgSenderAvatar)} />
                              <AvatarFallback>{msgSenderName.charAt(0)}</AvatarFallback>
                            </Avatar>
                          )}
                          
                          <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} ${isAnnouncement ? "w-full items-center" : "max-w-[80%] md:max-w-[65%]"}`}>
                            {!isOwn && showHeader && !isAnnouncement && (
                              <span className="text-xs text-muted-foreground ml-1 mb-1 font-medium">{msgSenderName}</span>
                            )}
                            
                            <div className={`relative rounded-2xl px-4 py-2.5 text-sm shadow-sm transition-all ${
                                isAnnouncement ? "bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/30 text-foreground w-full rounded-xl py-4 flex flex-col items-center text-center px-6"
                              : isOwn ? "bg-primary text-primary-foreground rounded-br-none" 
                              : "bg-card border rounded-bl-none"
                            }`}>
                              
                              {/* Quick Action Hover Bar */}
                              <div className={`absolute -top-4 opacity-0 group-hover:opacity-100 flex gap-1 bg-background border rounded-full p-1 shadow-md transition-opacity z-10 ${isOwn ? "right-0" : isAnnouncement ? "right-4" : "left-0"}`}>
                                <button onClick={() => toggleReaction(msg._id, "👍")} className="hover:bg-muted p-1 rounded-full text-base leading-none">👍</button>
                                <button onClick={() => toggleReaction(msg._id, "❤️")} className="hover:bg-muted p-1 rounded-full text-base leading-none">❤️</button>
                                <button onClick={() => toggleReaction(msg._id, "🔥")} className="hover:bg-muted p-1 rounded-full text-base leading-none">🔥</button>
                                {isAdmin && (
                                  <button onClick={() => togglePin(msg._id)} className="hover:bg-muted p-1.5 rounded-full text-muted-foreground hover:text-primary leading-none" title={msg.isPinned ? "Unpin" : "Pin"}>
                                    <Pin className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>

                              {isAnnouncement && (
                                <div className="flex items-center gap-2 mb-2 text-amber-600 dark:text-amber-500 font-bold uppercase tracking-wider text-xs">
                                  <Megaphone className="h-4 w-4" /> Announcement from {msgSenderName}
                                </div>
                              )}

                              {msg.attachment && msg.attachment.url && (
                                <div className={`mb-2 ${isAnnouncement ? "w-full flex justify-center" : ""}`}>
                                  {msg.attachment.type && msg.attachment.type.startsWith("image/") ? (
                                    <img 
                                      src={getFileUrl(msg.attachment.url)} 
                                      alt="attachment" 
                                      className={`rounded-lg max-w-full object-cover border border-white/20 ${isAnnouncement ? "max-h-80" : "max-h-60"}`}
                                    />
                                  ) : (
                                    <div className="bg-black/10 p-2 rounded flex items-center gap-2">
                                      <FileText className="h-4 w-4" />
                                      <a 
                                        href={getFileUrl(msg.attachment.url)} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="underline truncate max-w-[150px] hover:text-white pointer-events-auto"
                                      >
                                        Download File
                                      </a>
                                    </div>
                                  )}
                                </div>
                              )}

                              {msg.content && <p className={`break-words leading-relaxed ${isAnnouncement ? "text-base font-medium" : ""}`}>{msg.content}</p>}

                              <p className={`text-[10px] mt-1 opacity-70 ${isAnnouncement ? "text-center" : isOwn ? "text-right text-primary-foreground" : "text-right text-muted-foreground"}`}>
                                {formatMessageTime(msg.createdAt)}
                              </p>
                            </div>

                            {/* Reactions Display */}
                            {msg.reactions && msg.reactions.length > 0 && (
                              <div className={`flex flex-wrap gap-1 mt-1 ${isAnnouncement ? "justify-center" : isOwn ? "justify-end" : "justify-start"}`}>
                                {msg.reactions.map(r => (
                                  <button 
                                    key={r.emoji} 
                                    onClick={() => toggleReaction(msg._id, r.emoji)} 
                                    className={`text-[11px] leading-none px-2 py-1 flex items-center gap-1 rounded-full border shadow-sm transition-colors hover:bg-muted ${r.users.includes(currentUserId) ? 'bg-primary/20 border-primary/30 text-primary font-medium' : 'bg-card text-muted-foreground'}`}
                                  >
                                    <span>{r.emoji}</span> <span>{r.users.length}</span>
                                  </button>
                                ))}
                              </div>
                            )}

                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="p-4 border-t bg-card relative z-20">
                <input 
                  type="file" 
                  id="roomFileInput" 
                  className="hidden" 
                  onChange={handleFileSelect} 
                />

                {selectedFile && (
                    <div className="absolute -top-12 left-4 bg-background border p-2 rounded-md shadow-md flex items-center gap-2 text-xs">
                        <Paperclip className="h-3 w-3 text-muted-foreground" />
                        <span className="max-w-[200px] truncate font-medium">{selectedFile.name}</span>
                        <button onClick={() => setSelectedFile(null)} className="text-muted-foreground hover:text-destructive ml-2 p-1">
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                )}

                {showEmoji && (
                    <div className="absolute bottom-20 left-4 z-50 shadow-xl">
                        <EmojiPicker onEmojiClick={onEmojiClick} width={300} height={400} />
                    </div>
                )}

                {/* Optional Announcement Header in input */}
                {isAdmin && isAnnouncement && (
                  <div className="mb-2 flex items-center">
                    <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-semibold flex items-center">
                       <Megaphone className="w-3 h-3 mr-1" /> Broadcasting Announcement
                    </span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-end w-full">
                    <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => document.getElementById("roomFileInput")?.click()}>
                            <Paperclip className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setShowEmoji(!showEmoji)}>
                            <Smile className="h-5 w-5" />
                        </Button>
                        {isAdmin && (
                            <Button 
                              variant={isAnnouncement ? "default" : "ghost"} 
                              size="icon"
                              className={`rounded-full ${isAnnouncement ? "bg-amber-500 hover:bg-amber-600 text-white" : ""}`} 
                              onClick={() => setIsAnnouncement(!isAnnouncement)}
                              title="Toggle Announcement"
                            >
                                <Megaphone className="h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    <Input 
                        placeholder={isAnnouncement ? "Type your announcement..." : "Type a message to the room..."} 
                        value={newMessage} 
                        onChange={(e) => setNewMessage(e.target.value)} 
                        onKeyPress={handleKeyPress}
                        disabled={sending}
                        className={`rounded-xl flex-1 ${isAnnouncement ? "border-amber-400 focus-visible:ring-amber-500" : ""}`}
                    />
                    <Button onClick={handleSend} disabled={(!newMessage.trim() && !selectedFile) || sending} size="icon" className="rounded-full shrink-0">
                        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                </div>
              </div>
            </div>

            {/* Room Sidebar */}
            <div className={`w-full md:w-[280px] lg:w-[320px] border-l bg-card flex flex-col ${!showSidebar ? "hidden md:flex" : "flex"}`}>
              <div className="p-4 border-b flex justify-between items-center bg-card">
                <h2 className="font-semibold text-foreground">Room Info</h2>
                <div className="flex gap-2">
                  {isAdmin && (
                     <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                       <DialogTrigger asChild>
                         <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10" title="Invite Members">
                           <UserPlus className="h-4 w-4" />
                         </Button>
                       </DialogTrigger>
                       <DialogContent className="sm:max-w-md">
                         <DialogHeader>
                           <DialogTitle>Invite to Room</DialogTitle>
                         </DialogHeader>
                         <div className="flex items-center space-x-2 my-2 border rounded-md px-3 py-2 bg-background">
                           <Search className="h-4 w-4 text-muted-foreground" />
                           <input 
                             type="text" 
                             placeholder="Search users..." 
                             className="flex-1 bg-transparent outline-none text-sm"
                             value={inviteSearch}
                             onChange={(e) => setInviteSearch(e.target.value)}
                           />
                         </div>
                         <ScrollArea className="h-[300px] mt-2 border rounded-md p-2">
                           {availableUsersToInvite.length > 0 ? (
                             <div className="space-y-2">
                               {availableUsersToInvite.map(u => (
                                 <div key={u.id} className="flex items-center justify-between p-2 hover:bg-secondary/50 rounded-md">
                                    <div className="flex items-center gap-3">
                                      <Avatar className="h-8 w-8">
                                        <AvatarImage src={getAvatarUrl(u.avatar_url)} />
                                        <AvatarFallback>{u.full_name?.charAt(0) || "U"}</AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <p className="text-sm font-medium">{u.full_name}</p>
                                        <p className="text-[10px] text-muted-foreground capitalize">{u.role}</p>
                                      </div>
                                    </div>
                                    <Button size="sm" variant="outline" onClick={() => handleInvite(u.id)}>Invite</Button>
                                 </div>
                               ))}
                             </div>
                           ) : (
                             <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-8">
                               <p className="text-sm">No users found</p>
                             </div>
                           )}
                         </ScrollArea>
                       </DialogContent>
                     </Dialog>
                  )}
                  <Button variant="ghost" size="icon" className="md:hidden h-8 w-8" onClick={() => setShowSidebar(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                    <p className="text-sm">{roomDetails?.description || "No description provided."}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center justify-between">
                      <span>Members ({roomDetails?.members?.length || 0})</span>
                    </h3>
                    <div className="space-y-3">
                      {roomDetails?.members?.map((member: any) => (
                        <div key={member._id} className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={getAvatarUrl(member.avatar_url)} />
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {member.name} 
                              {member._id === currentUserId && " (You)"}
                            </p>
                            <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                          </div>
                          {roomDetails.admins?.some((a: any) => a._id === member._id) && (
                            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded uppercase font-semibold tracking-wider">
                              Admin
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
