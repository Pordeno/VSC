// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

export type { InitWorkspaceSettings }
export { pickInitWorkspace }

import { MultiStepInput } from './multi_step_input'


const quickPickYesNo = [
    { label : 'Yes' } ,
    { label : 'No' }
]

interface InitWorkspaceSettings {
    unstable : boolean
    lint : boolean
}


function pickInitWorkspace (){

    interface State extends InitWorkspaceSettings {
        totalSteps : number
        title : string
        step : number
    }

    const title = `Initialize Project`

    async function pickLint (
        input : MultiStepInput ,
        state : Partial<State>
    ){

        const pick = await input.showQuickPick({
            shouldResume : async () => false ,
            placeholder : `Enable Deno linting?` ,
            totalSteps : 2 ,
            items : quickPickYesNo ,
            title : title ,
            step : 1
        })

        state.lint = ( pick.label === 'Yes' )
            ? true : false

        return ( input : MultiStepInput ) =>
            pickUnstable(input,state)
    }

    async function pickUnstable (
        input : MultiStepInput ,
        state : Partial<State>
    ){

        const pick = await input.showQuickPick({
            shouldResume : async () => false ,
            placeholder : `Enable Deno unstable APIs?` ,
            totalSteps : 2 ,
            items : quickPickYesNo ,
            title : title ,
            step : 2 ,
        })

        state.unstable = ( pick.label === 'Yes' )
            ? true : false
    }

    async function collectInputs (){

        const state : Partial<State> = {}

        await MultiStepInput.run(( input ) => pickLint(input,state))

        return state as InitWorkspaceSettings
    }

    return collectInputs()
}
