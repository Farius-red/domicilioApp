import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { AddGenerales, GetGenerales, UpdateGenerales, DeleteGenerales } from './generales.actions';

export class GeneralesStateModel {
    public generales: any;
}

@State<any>({
    name: 'generales',
    defaults: {
        generales: [],
    },
})
@Injectable()
export class GeneralesState {
    constructor() { }

    @Selector()
    public static getGenerales({ generales }: any): any {
        return generales;
    }

    @Action(AddGenerales)
    addBook(
        { getState, patchState, setState }: StateContext<any>,
        { payload }: AddGenerales
    ): Observable<any> {
        const state = getState();

        return patchState({
            // books: [...state.books, book],
            generales: [...state.generales.filter(e => e.name != payload.name), { name: payload.name, valor: payload.valor }],
        });



    }


    @Action(GetGenerales)
    getGeneral({
        getState,
        setState,
    }: StateContext<any>): Observable<any> {
        const state = getState();
        return setState({ ...state.generales });
    }

    @Action(UpdateGenerales)
    updateBook(
        { getState, setState }: StateContext<any>,
        { payload }: UpdateGenerales
    ): Observable<any> {
        const state = getState();
        let g = state.generales;
        g.find(e => e.name == payload.name).valor = payload.valor;
        return setState({ ...state, g });
    }

    @Action(DeleteGenerales)
    deleteBook(
        { getState, patchState }: StateContext<any>,
        { id }: DeleteGenerales
    ): Observable<any> {
        const state = getState();
        let g = state.generales;
        g = g.filter(e => e.name != id);
        return patchState({
            generales: [...g]
        });

    }
}
