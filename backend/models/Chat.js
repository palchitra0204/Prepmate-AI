const mongoose = require("mongoose");


const chatSchema =
    new mongoose.Schema(
        {
            /*
             * Chat kis user ki hai.
             */

            user: {
                type:
                    mongoose.Schema.Types.ObjectId,

                ref:
                    "User",

                required: [
                    true,
                    "Chat user is required",
                ],

                index:
                    true,
            },


            /*
             * Chat kis uploaded material
             * ke saath connected hai.
             */

            material: {
                type:
                    mongoose.Schema.Types.ObjectId,

                ref:
                    "Material",

                required: [
                    true,
                    "Chat material is required",
                ],

                index:
                    true,
            },


            /*
             * Chat title initially
             * "New Chat" rahega.
             *
             * First message ke baad title
             * automatically update karenge.
             */

            title: {
                type:
                    String,

                trim:
                    true,

                maxlength:
                    100,

                default:
                    "New Chat",
            },


            /*
             * Sidebar/history preview
             * ke liye last message.
             */

            lastMessage: {
                type:
                    String,

                trim:
                    true,

                maxlength:
                    300,

                default:
                    "",
            },


            /*
             * Total user and assistant
             * messages count.
             */

            messageCount: {
                type:
                    Number,

                min:
                    0,

                default:
                    0,
            },


            /*
             * Chat ko permanently delete
             * kiye bina hide/archive karne
             * ke liye.
             */

            isArchived: {
                type:
                    Boolean,

                default:
                    false,

                index:
                    true,
            },
        },

        {
            timestamps:
                true,
        }
    );


/*
 * User ki latest chats quickly
 * retrieve karne ke liye.
 */

chatSchema.index({
    user:
        1,

    updatedAt:
        -1,
});


/*
 * Selected material ki chats
 * retrieve karne ke liye.
 */

chatSchema.index({
    user:
        1,

    material:
        1,

    updatedAt:
        -1,
});


module.exports =
    mongoose.model(
        "Chat",
        chatSchema
    );