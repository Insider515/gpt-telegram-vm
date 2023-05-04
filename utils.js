import {unlink} from 'fs/promises'
//Видалення зайвих файлів
export async function removeFile(path){
try {
    await unlink( path )
} catch (e) {
    console.log('Error while removeFile', e.message)
}
}