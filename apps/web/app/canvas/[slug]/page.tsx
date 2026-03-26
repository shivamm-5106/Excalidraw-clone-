// app/canvas/[slug]/page.tsx

import RoomCanvas from "../../../components/RoomCanvas";

import axios from "axios";
import { notFound } from "next/navigation";

export default async function Page({
    params,
}: {
    params: { slug: string };
}) {
    const { slug } = await params;

    try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/room/${slug}`);
        const roomId = res.data.room.id;

        return <RoomCanvas slug={slug} roomId={roomId} />;
    } catch (err) {
        console.error("Room fetch error:", err);
        notFound(); // clean Next.js 404 page
    }
}
