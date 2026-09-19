import {
    Bot,
    FileText,
    LoaderCircle,
    MessageCircle,
    Plus,
    Send,
    Trash2,
    User,
} from "lucide-react";

import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import Sidebar from "../components/Sidebar";
import api from "../services/api";

import "../styles/materialChat.css";


const MaterialChat = () => {
    const {
        materialId,
    } = useParams();

    const navigate =
        useNavigate();

    const [
        chats,
        setChats,
    ] = useState([]);

    const [
        selectedChat,
        setSelectedChat,
    ] = useState(null);

    const [
        messages,
        setMessages,
    ] = useState([]);

    const [
        input,
        setInput,
    ] = useState("");

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        sending,
        setSending,
    ] = useState(false);

    const [
        creating,
        setCreating,
    ] = useState(false);

    const [
        deletingChatId,
        setDeletingChatId,
    ] = useState("");

    const [
        error,
        setError,
    ] = useState("");

    const initializedRef =
        useRef(false);

    const messagesEndRef =
        useRef(null);


    const scrollToBottom = () => {
        messagesEndRef.current
            ?.scrollIntoView({
                behavior: "smooth",
            });
    };


    useEffect(() => {
        scrollToBottom();
    }, [
        messages,
        sending,
    ]);


    const loadChat = async (
        chatId
    ) => {
        try {
            setLoading(true);
            setError("");

            const response =
                await api.get(
                    `/chats/${chatId}`
                );

            setSelectedChat(
                response.data?.chat ||
                null
            );

            setMessages(
                response.data?.messages ||
                []
            );
        } catch (requestError) {
            console.error(
                "Load Chat Error:",
                requestError.response
                    ?.data ||
                requestError.message
            );

            setError(
                requestError.response
                    ?.data?.message ||
                "Unable to load chat"
            );
        } finally {
            setLoading(false);
        }
    };


    const loadChats = async () => {
        const response =
            await api.get("/chats");

        const loadedChats =
            response.data?.chats ||
            [];

        setChats(loadedChats);

        return loadedChats;
    };


    const createChat = async (
        selectedMaterialId
    ) => {
        try {
            setCreating(true);
            setError("");

            const response =
                await api.post(
                    "/chats",
                    {
                        materialId:
                            selectedMaterialId,
                    }
                );

            const newChat =
                response.data?.chat;

            if (!newChat) {
                throw new Error(
                    "Chat was not created"
                );
            }

            setChats(
                (previousChats) => [
                    newChat,
                    ...previousChats,
                ]
            );

            setSelectedChat(
                newChat
            );

            setMessages([]);

            navigate(
                `/chat/${selectedMaterialId}`,
                {
                    replace: true,
                }
            );

            return newChat;
        } catch (requestError) {
            console.error(
                "Create Chat Error:",
                requestError.response
                    ?.data ||
                requestError.message
            );

            setError(
                requestError.response
                    ?.data?.message ||
                requestError.message ||
                "Unable to create chat"
            );

            return null;
        } finally {
            setCreating(false);
            setLoading(false);
        }
    };


    useEffect(() => {
        if (
            initializedRef.current
        ) {
            return;
        }

        initializedRef.current = true;

        const initializeChat =
            async () => {
                try {
                    setLoading(true);
                    setError("");

                    const loadedChats =
                        await loadChats();

                    if (materialId) {
                        const materialChats =
                            loadedChats.filter(
                                (chat) =>
                                    chat.material
                                        ?._id ===
                                    materialId
                            );

                        if (
                            materialChats.length >
                            0
                        ) {
                            await loadChat(
                                materialChats[0]
                                    ._id
                            );
                        } else {
                            await createChat(
                                materialId
                            );
                        }

                        return;
                    }

                    if (
                        loadedChats.length >
                        0
                    ) {
                        await loadChat(
                            loadedChats[0]
                                ._id
                        );
                    } else {
                        setLoading(false);
                    }
                } catch (requestError) {
                    console.error(
                        "Initialize Chat Error:",
                        requestError.response
                            ?.data ||
                        requestError.message
                    );

                    setError(
                        requestError.response
                            ?.data?.message ||
                        "Unable to initialize chat"
                    );

                    setLoading(false);
                }
            };

        initializeChat();
    }, [
        materialId,
    ]);


    const handleSelectChat = (
        chatId
    ) => {
        if (
            chatId ===
            selectedChat?._id
        ) {
            return;
        }

        loadChat(chatId);
    };


    const handleNewChat =
        async () => {
            const selectedMaterialId =
                materialId ||
                selectedChat?.material
                    ?._id;

            if (!selectedMaterialId) {
                setError(
                    "Please open a material before creating a new chat"
                );

                return;
            }

            await createChat(
                selectedMaterialId
            );
        };


    const handleSendMessage =
        async (event) => {
            event.preventDefault();

            const message =
                input.trim();

            if (
                !message ||
                !selectedChat?._id ||
                sending
            ) {
                return;
            }

            const temporaryMessage = {
                _id:
                    `temporary-${Date.now()}`,

                role:
                    "user",

                content:
                    message,

                createdAt:
                    new Date()
                        .toISOString(),
            };

            setMessages(
                (previousMessages) => [
                    ...previousMessages,
                    temporaryMessage,
                ]
            );

            setInput("");
            setSending(true);
            setError("");

            try {
                const response =
                    await api.post(
                        `/chats/${selectedChat._id}/messages`,
                        {
                            message,
                        }
                    );

                const userMessage =
                    response.data
                        ?.userMessage;

                const assistantMessage =
                    response.data
                        ?.assistantMessage;

                setMessages(
                    (previousMessages) => [
                        ...previousMessages.filter(
                            (item) =>
                                item._id !==
                                temporaryMessage._id
                        ),

                        userMessage,

                        assistantMessage,
                    ].filter(Boolean)
                );

                const updatedChat =
                    response.data?.chat;

                if (updatedChat) {
                    setSelectedChat(
                        updatedChat
                    );

                    setChats(
                        (
                            previousChats
                        ) => [
                                updatedChat,

                                ...previousChats.filter(
                                    (chat) =>
                                        chat._id !==
                                        updatedChat._id
                                ),
                            ]
                    );
                }
            } catch (requestError) {
                console.error(
                    "Send Message Error:",
                    requestError.response
                        ?.data ||
                    requestError.message
                );

                setMessages(
                    (
                        previousMessages
                    ) =>
                        previousMessages.filter(
                            (item) =>
                                item._id !==
                                temporaryMessage._id
                        )
                );

                setInput(message);

                setError(
                    requestError.response
                        ?.data?.message ||
                    "Unable to send message"
                );
            } finally {
                setSending(false);
            }
        };


    const handleDeleteChat =
        async (
            event,
            chatId
        ) => {
            event.stopPropagation();

            const confirmed =
                window.confirm(
                    "Delete this chat and all of its messages?"
                );

            if (!confirmed) {
                return;
            }

            try {
                setDeletingChatId(
                    chatId
                );

                setError("");

                await api.delete(
                    `/chats/${chatId}`
                );

                const remainingChats =
                    chats.filter(
                        (chat) =>
                            chat._id !==
                            chatId
                    );

                setChats(
                    remainingChats
                );

                if (
                    selectedChat?._id ===
                    chatId
                ) {
                    if (
                        remainingChats.length >
                        0
                    ) {
                        await loadChat(
                            remainingChats[0]
                                ._id
                        );
                    } else {
                        setSelectedChat(
                            null
                        );

                        setMessages([]);
                    }
                }
            } catch (requestError) {
                console.error(
                    "Delete Chat Error:",
                    requestError.response
                        ?.data ||
                    requestError.message
                );

                setError(
                    requestError.response
                        ?.data?.message ||
                    "Unable to delete chat"
                );
            } finally {
                setDeletingChatId("");
            }
        };


    return (
        <div className="material-chat-page">
            <Sidebar />

            <main className="material-chat-main">

                <header className="material-chat-header">
                    <div>
                        <p className="material-chat-eyebrow">
                            AI STUDY ASSISTANT
                        </p>

                        <h1>
                            Chat with your material
                        </h1>

                        <span>
                            Ask questions and receive answers grounded in your uploaded document.
                        </span>
                    </div>

                    <button
                        type="button"
                        className="material-chat-new-button"
                        onClick={
                            handleNewChat
                        }
                        disabled={
                            creating ||
                            !(
                                materialId ||
                                selectedChat
                                    ?.material
                                    ?._id
                            )
                        }
                    >
                        {creating ? (
                            <LoaderCircle
                                size={18}
                                className="material-chat-spin"
                            />
                        ) : (
                            <Plus size={18} />
                        )}

                        New chat
                    </button>
                </header>


                {error && (
                    <div
                        className="material-chat-error"
                        role="alert"
                    >
                        {error}
                    </div>
                )}


                <section className="material-chat-layout">

                    <aside className="material-chat-history">
                        <div className="material-chat-history-heading">
                            <MessageCircle
                                size={18}
                            />

                            <span>
                                Chat history
                            </span>
                        </div>

                        <div className="material-chat-history-list">
                            {chats.length ===
                                0 ? (
                                <div className="material-chat-history-empty">
                                    <MessageCircle
                                        size={25}
                                    />

                                    <p>
                                        No chats yet
                                    </p>
                                </div>
                            ) : (
                                chats.map(
                                    (chat) => (
                                        <button
                                            key={
                                                chat._id
                                            }
                                            type="button"
                                            className={
                                                selectedChat
                                                    ?._id ===
                                                    chat._id
                                                    ? "material-chat-history-item active"
                                                    : "material-chat-history-item"
                                            }
                                            onClick={() =>
                                                handleSelectChat(
                                                    chat._id
                                                )
                                            }
                                        >
                                            <span className="material-chat-history-icon">
                                                <FileText
                                                    size={17}
                                                />
                                            </span>

                                            <span className="material-chat-history-information">
                                                <strong>
                                                    {chat.title ||
                                                        "New Chat"}
                                                </strong>

                                                <small>
                                                    {chat
                                                        .material
                                                        ?.title ||
                                                        "Study material"}
                                                </small>
                                            </span>

                                            <span
                                                role="button"
                                                tabIndex={0}
                                                className="material-chat-delete-button"
                                                onClick={(
                                                    event
                                                ) =>
                                                    handleDeleteChat(
                                                        event,
                                                        chat._id
                                                    )
                                                }
                                                onKeyDown={(
                                                    event
                                                ) => {
                                                    if (
                                                        event.key ===
                                                        "Enter" ||
                                                        event.key ===
                                                        " "
                                                    ) {
                                                        handleDeleteChat(
                                                            event,
                                                            chat._id
                                                        );
                                                    }
                                                }}
                                                aria-label="Delete chat"
                                            >
                                                {deletingChatId ===
                                                    chat._id ? (
                                                    <LoaderCircle
                                                        size={16}
                                                        className="material-chat-spin"
                                                    />
                                                ) : (
                                                    <Trash2
                                                        size={16}
                                                    />
                                                )}
                                            </span>
                                        </button>
                                    )
                                )
                            )}
                        </div>
                    </aside>


                    <div className="material-chat-panel">

                        {loading ? (
                            <div className="material-chat-loading">
                                <LoaderCircle
                                    size={32}
                                    className="material-chat-spin"
                                />

                                <p>
                                    Loading chat...
                                </p>
                            </div>
                        ) : !selectedChat ? (
                            <div className="material-chat-empty">
                                <div className="material-chat-empty-icon">
                                    <MessageCircle
                                        size={34}
                                    />
                                </div>

                                <h2>
                                    Start a material chat
                                </h2>

                                <p>
                                    Open a ready material and select Chat with AI.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="material-chat-panel-header">
                                    <div className="material-chat-material-icon">
                                        <FileText
                                            size={20}
                                        />
                                    </div>

                                    <div>
                                        <strong>
                                            {selectedChat
                                                .material
                                                ?.title ||
                                                "Study material"}
                                        </strong>

                                        <span>
                                            {selectedChat
                                                .material
                                                ?.originalFileName ||
                                                "Uploaded document"}
                                        </span>
                                    </div>
                                </div>


                                <div className="material-chat-messages">

                                    {messages.length ===
                                        0 && (
                                            <div className="material-chat-welcome">
                                                <div className="material-chat-welcome-icon">
                                                    <Bot
                                                        size={31}
                                                    />
                                                </div>

                                                <h2>
                                                    Ask PrepMate AI
                                                </h2>

                                                <p>
                                                    Ask any question related to this material.
                                                </p>
                                            </div>
                                        )}


                                    {messages.map(
                                        (
                                            message
                                        ) => (
                                            <article
                                                key={
                                                    message._id
                                                }
                                                className={
                                                    message.role ===
                                                        "user"
                                                        ? "material-chat-message material-chat-message-user"
                                                        : "material-chat-message material-chat-message-assistant"
                                                }
                                            >
                                                <div className="material-chat-message-avatar">
                                                    {message.role ===
                                                        "user" ? (
                                                        <User
                                                            size={18}
                                                        />
                                                    ) : (
                                                        <Bot
                                                            size={18}
                                                        />
                                                    )}
                                                </div>

                                                <div className="material-chat-message-content">
                                                    <span>
                                                        {message.role ===
                                                            "user"
                                                            ? "You"
                                                            : "PrepMate AI"}
                                                    </span>

                                                    <p>
                                                        {
                                                            message.content
                                                        }
                                                    </p>
                                                </div>
                                            </article>
                                        )
                                    )}


                                    {sending && (
                                        <article className="material-chat-message material-chat-message-assistant">
                                            <div className="material-chat-message-avatar">
                                                <Bot
                                                    size={18}
                                                />
                                            </div>

                                            <div className="material-chat-message-content">
                                                <span>
                                                    PrepMate AI
                                                </span>

                                                <div className="material-chat-typing">
                                                    <i />
                                                    <i />
                                                    <i />
                                                </div>
                                            </div>
                                        </article>
                                    )}

                                    <div
                                        ref={
                                            messagesEndRef
                                        }
                                    />
                                </div>


                                <form
                                    className="material-chat-form"
                                    onSubmit={
                                        handleSendMessage
                                    }
                                >
                                    <textarea
                                        value={
                                            input
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setInput(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        onKeyDown={(
                                            event
                                        ) => {
                                            if (
                                                event.key ===
                                                "Enter" &&
                                                !event.shiftKey
                                            ) {
                                                event.preventDefault();

                                                handleSendMessage(
                                                    event
                                                );
                                            }
                                        }}
                                        placeholder="Ask a question about this material..."
                                        maxLength={5000}
                                        disabled={
                                            sending
                                        }
                                        rows={1}
                                        aria-label="Chat message"
                                    />

                                    <button
                                        type="submit"
                                        disabled={
                                            sending ||
                                            !input.trim()
                                        }
                                        aria-label="Send message"
                                    >
                                        {sending ? (
                                            <LoaderCircle
                                                size={20}
                                                className="material-chat-spin"
                                            />
                                        ) : (
                                            <Send
                                                size={20}
                                            />
                                        )}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default MaterialChat;