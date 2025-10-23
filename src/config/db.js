import mongoose from "mongoose";

export default class DataBase {
    #uri;

    constructor (uri) {
        this.#uri = uri;
    }

    async connect () {
        try {
            await mongoose.connect(this.#uri);
            console.log('Connection Successful');
        }catch (e) {
            console.error("error while connecting \n", e);
        }
    }

    async disconnect () {
        try {
            await mongoose.disconnect();
            console.log('MongoDB disconnected');
        }catch (e) {
            console.error(`disconnection error: \n`, e);
        }
    }
}