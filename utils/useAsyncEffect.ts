import { useEffect, useReducer, Reducer } from "react";

interface LoadStarted { type: 'STARTED'; }
interface LoadComplete<TResult> { type: 'COMPLETE'; result: TResult; }
interface LoadFailed { type: 'FAILED'; error: any; }
type LoadAction<TResult> = LoadStarted | LoadComplete<TResult> | LoadFailed;
type AsyncFunction<TResult> = () => Promise<TResult>;

interface State<TResult> {
    isLoading: boolean;
    result?: TResult;
    error?: any;
}

function reducer<TResult>(state: State<TResult>, action: LoadAction<TResult>) {
    switch (action.type) {
        case 'STARTED':
            return { ...state, isLoading: true, error: undefined };
        case 'COMPLETE':
            return { ...state, isLoading: false, result: action.result };
        case 'FAILED':
            return { ...state, isLoading: false, error: action.error };
    }
}

function useAsyncEffect<TResult>(action: AsyncFunction<TResult>, dependencies: any[]) {
    type ReducerType = Reducer<State<TResult>, LoadAction<TResult>>;
    const [state, dispatch] = useReducer<ReducerType>(reducer, {
        isLoading: false
    });

    useEffect(() => {
        async function loadTheThings() {
            dispatch({ type: 'STARTED' });
            try {
                const result = await action();
                dispatch({ type: 'COMPLETE', result });
            } catch (error) {
                dispatch({ type: 'FAILED', error });
            }
        }

        loadTheThings();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, dependencies);

    return state;
}

export default useAsyncEffect;