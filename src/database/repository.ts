import { Document, Model, QueryOptions, UpdateQuery } from "mongoose";
import { SchemaProperties, SchemaInferType } from "src/types/Schema";

export default class Repository<T extends SchemaProperties, U extends SchemaInferType<T>> {
    constructor(public model: Model<any>, public object: T) {}

    public async exists(id: U['_id']): Promise<true | null> {
        return (await this.model.findById(id)) ? true : null;
    }

    public async remove(id: U['_id']): Promise<U | null> {
        return await this.model.findByIdAndDelete(id);
    }

    public async create(data: Pick<U, '_id'> & Partial<U>, returnDocument: boolean = false): Promise<U | null> {
        const document = await this.model.create(data);
        return returnDocument ? document : null
    }

    public async get(id: U['_id']): Promise<U | null> {
        return await this.model.findById(id) || null;
    }

    public async update(id: U['_id'], update: UpdateQuery<Omit<U, '_id'>>, options?: QueryOptions<U>): Promise<U | null> {
        const document = await this.model.findByIdAndUpdate({ _id: id }, update, options)
        return (options?.new) ? document : null
    }

    public async find<K extends keyof U>(id: U['_id'], keys: K): Promise<U[K] | null>
    public async find<K extends keyof U>(id: U['_id'], keys: K[]): Promise<Pick<U, typeof keys[number]> | null>;
    public async find<K extends (keyof U | Array<keyof U>)>(id: U['_id'], keys: K) {
        let document = await this.get(id) as U;
        if (!document) return null;

        if(typeof keys == "string") return document[keys as keyof U];

        if (Array.isArray(keys)) {
            const object = keys.reduce((acc, curr) => 
            ({ ...acc, [curr]: document[curr] }), {})

            return object as Pick<U, typeof keys[number]>
        }
    }
}