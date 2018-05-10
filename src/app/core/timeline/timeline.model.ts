/**
 * Timeline model class
 * to store data that gets populated
 * on the timeline view.
 */
export class Timeline {
    private _title: string;
    private _timestamp: string;
    private _body: string;

    get title(): string {
        return this._title;
    }

    set title(newTitle: string) {
        this._title = newTitle;
    }

    get timestamp(): string {
        return this._timestamp;
    }

    set timestamp(newTimestamp: string) {
        this._timestamp = newTimestamp;
    }

    get body(): string {
        return this._body;
    }

    set body(newBody: string) {
        this._body = newBody;
    }
}
