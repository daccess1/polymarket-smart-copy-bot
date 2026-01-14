import {Collection, Db, MongoClient} from "mongodb";
import type {Document} from "mongodb";
import {ObjectId as ObjectIdBase} from "mongodb";
import type {WithId as WithIdBase} from "mongodb";
import path from "path";

/**
 * Exports of default mongo types for Webstorm auto-import
 */
export class ObjectId extends ObjectIdBase {}
export type WithId<TSchema> = WithIdBase<TSchema>;

let dbClient: DbClient | null = null;

export function getDbClient() {
    if (!dbClient) {
        dbClient = new DbClient();
    }

    return dbClient;
}

/**
 * Клиент для соединения с MongoDB
 *
 * Получает данные роутинга и авторизации из переменных окружения
 */
export class DbClient {
    private readonly _client: MongoClient;
    private readonly _db: Db;

    constructor(overrideDbName?: string) {
        const dbHost: string = process.env.DB_HOST || 'localhost:27017';
        const dbProtocol: string = process.env.DB_PROTOCOL || 'mongodb';
        let dbName: string | undefined = process.env.DB_NAME || undefined;
        let dbAuthSource: string | undefined = process.env.DB_AUTH_SOURCE || undefined;

        if (process.env.NODE_ENV === 'test' && !dbName) {
            console.log("Setting fallback dbName for test");
            dbName = "fallbackTest";
        }

        const dbUser = process.env.DB_USER;
        const dbPassword = process.env.DB_PASSWORD;
        const dbUseCa = process.env.DB_USE_CA === "true";

        if (overrideDbName) {
            dbName = overrideDbName;
        }

        if (!dbName) {
            throw new Error('DB name is not set');
        }

        if (!dbAuthSource) {
            dbAuthSource = dbName;
        }

        const clientOptions = {
            tls: false,
            tlsCAFile: (undefined as any),
            authSource: dbAuthSource
        }

        if (dbUseCa) {
            const dbCaCert = path.resolve(__dirname, '../../DB_CA.pem');
            clientOptions.tls = true;
            clientOptions.tlsCAFile = dbCaCert;
        }

        let connectionString = `${dbProtocol}://`;

        if (dbUser && dbPassword) {
            connectionString += `${dbUser}:${dbPassword}@${dbHost}`;
        } else {
            connectionString += dbHost;
        }

        this._client = new MongoClient(connectionString, clientOptions);

        this._db = this._client.db(dbName);
    }

    /**
     * Получение объекта коллекции в БД
     *
     * @param {string} collection имя коллекции
     */
    public getCollection<T extends Document>(collection: string): Collection<T> {
        return this._db.collection<T>(collection);
    }

    /**
     * Проверка соединения с БД
     */
    public async checkConnection() {
        try {
            const ping = await this._db.admin().ping();

            return (ping.ok == 1);
        } catch (ex: any) {
            console.log('Error on connecting to mongo: ', ex.message);
            return false;
        }
    }

    /**
     * Удаление коллекции документов (не работает в продкашене, предназначено для очистки данных тестов)
     *
     * @param collection имя коллекции
     */
    public async dropCollection(collection: string) {
        if (process.env.NODE_ENV === 'production') {
            console.error('Could not drop collection in production environment');
            return;
        }

        await this._db.dropCollection(collection);
    }

    /**
     * Удаление БД (не работает в продкашене, предназначено для очистки данных тестов)
     */
    public async dropDatabase() {
        if (process.env.NODE_ENV === 'production') {
            console.error('Could not drop DB in productionuction environment');
            return;
        }

        await this._db.dropDatabase();
    }

    /**
     * Закрытие соединения с Mongo
     */
    public async close() {
        if (this._client && process.env.NODE_ENV !== 'test') {
            await this._client.close();
        }
    }

    /**
     * Выполнение команды findOneAndUpdate
     *
     * @param collection имя коллекции
     * @param filter объект фильтра
     * @param updates объект с обновлениями
     * @param upsert признак того, что надо создать новый документ в коллекции, если под фильтр ничего не подходит
     */
    public static async findOneAndUpdate(
        collection: string,
        filter: {[key: string]: any} = {},
        updates: { [key: string]: any} = {},
        upsert: boolean = false) {
        const client = new DbClient();

        const result =  await client.getCollection(collection).findOneAndUpdate(filter, updates, {upsert: upsert, returnDocument: "after"});

        await client.close();

        return result;
    }

    /**
     * Выполение команды find() и toArray()
     *
     * @param collection имя коллекции
     * @param filter объект фильтра
     */
    public static async findAsArray<T extends Document>(collection: string, filter: {[key: string]: any} = {}) {
        const client = new DbClient();

        const result =  await client.getCollection(collection).find<T>(filter).toArray();

        await client.close();

        return result;
    }

    /**
     * Проверка существования документа по заданному фильтру
     *
     * @param collection
     * @param filter
     */
    public async checkIfExists(collection: string, filter: {[key: string]: any} = {}) {
        const result = await this.getCollection(collection).countDocuments(filter);

        return !!result;
    }
}

export default DbClient;