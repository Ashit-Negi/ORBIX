import PostCard from "../PostCard";

export default function ProfilePosts({ posts }) {
  if (!posts.length) {
    return (
      <div className="dark-card rounded-[32px] p-14 text-center">
        <div className="w-20 h-20 rounded-full bg-white/5 mx-auto flex items-center justify-center text-3xl">
          ✨
        </div>

        <h2 className="text-2xl font-semibold mt-6">No Posts Yet</h2>

        <p className="text-[#9ca3af] mt-3 max-w-md mx-auto leading-7">
          This user hasn’t shared any posts yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <div
          key={post.id}
          className="bg-[#0f172a] border border-white/5 rounded-[30px] p-2"
        >
          <PostCard
            id={post.id}
            title={post.title}
            content={post.content}
            votes={post.votes}
            commentCount={post.commentCount}
            author={post.author.username}
            authorId={post.author.id}
            community={post.community}
          />
        </div>
      ))}
    </div>
  );
}
