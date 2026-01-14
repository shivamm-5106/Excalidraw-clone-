


import RoomCanvas from "../../../components/RoomCanvas";
import { BACKEND_URL } from "../../../config";
import axios from "axios";


// export default async function Page(props: any) {
//     console.log("PROPS:", props);
//     console.log("PARAMS:", props.params);
//     return (
//         <div>debug page</div>
//     );
// }


export default async function Page({ params, }
    : {
        params: {
            slug: string
        }
    }
) {
    const slug = (await params).slug;
    console.log(slug)
    const res = await axios.get(`${BACKEND_URL}/chats/${slug}`);
    const roomId = res.data.roomId;

    return (

        <RoomCanvas slug={slug} roomId={roomId}/>
    );
}