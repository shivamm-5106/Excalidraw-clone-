// app/canvas/[slug]/page.tsx

import RoomCanvas from "../../../components/RoomCanvas";

import axios from "axios";
import { notFound } from "next/navigation";

export default async function Page({
    params,
}: {
    params: { slug: string };
}) {
    const {slug} = await params;

    try {
        const res = await axios.get(`${process.env.BACKEND_URL}/chats/${slug}`);
        const roomId = res.data.roomId;

        return <RoomCanvas slug={slug} roomId={roomId} />;
    } catch (err) {
        console.error("Room fetch error:", err);
        notFound(); // clean Next.js 404 page
    }
}
