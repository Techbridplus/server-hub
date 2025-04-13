import { type NextRequest, NextResponse } from "next/server"
import { authMiddlewareAppRouter, isServerAdmin } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { useParams } from "next/navigation";

export async function GET(req: NextRequest, { params }: { params: { groupId: string } }) {
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get("groupId") || params.groupId; // Use groupId from params if not in searchParams

    if (!groupId) {
        console.error("groupId is undefined");
        return NextResponse.json(
            { success: false, error: "Missing groupId in request parameters" },
            { status: 400 }
        );
    }

    return authMiddlewareAppRouter(req, async (req, session, prisma) => {
        const userId = session.user.id;

        // Validate input
        if (!userId || !groupId) {
            return NextResponse.json(
                { success: false, error: "Missing userId or groupId" },
                { status: 400 }
            );
        }

        try {
            // Fetch the group member's role
            const groupMember = await prisma.groupMember.findFirst({
                where: {
                    userId,
                    groupId,
                },
                select: {
                    role: true, // Fetch only the role field
                },
            });

            if (!groupMember) {
                return NextResponse.json({ error: "User is not a member of this group" }, { status: 403 });
            }

            return NextResponse.json(groupMember);
        } catch (error) {
            console.error("Error fetching user role:", error);
            return NextResponse.json({ error: "Failed to fetch role" }, { status: 500 });
        }
    });
}