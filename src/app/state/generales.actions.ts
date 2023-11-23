export class AddGenerales {
    static readonly type = '[Generales] Add';
    constructor(public payload: any) {}
}

export class GetGenerales {
    static readonly type = '[Generales] Get';
}
export class UpdateGenerales {
    static readonly type = '[Generales] Update';
    constructor(public payload: any) { }
}
export class DeleteGenerales {
    static readonly type = '[Generales] Delete';
    constructor(public id: string) { }
}