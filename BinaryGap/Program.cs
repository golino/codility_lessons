using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BinaryGap
{
	class Program
	{
		static void Main(string[] args)
		{
			Console.WriteLine("Digite o número:");
			uint number = uint.Parse(Console.ReadLine());

			Console.WriteLine(solution((int)number));
			Console.ReadLine();
		}
		public static int solution(int N)
		{
			if (N == 0)
				return 0;

			if (Math.Log(N, 2) % 1 == 0)
				return 0;

			int n2 = N;
			List<int> binaryList = new List<int>();
			int count = 0, count2 = 0, maxIndex = 0, minIndex = 0;

			for (long i = 1; i <= N; i *= 2, binaryList.Add(1)) ;

			for (int i = binaryList.Count - 1; i >= 0; i--)
			{
				if (!(Math.Pow(2, i) <= n2))
					binaryList[i] = 0;
				else
					n2 -= (int)Math.Pow(2, i);
			}

			maxIndex = binaryList.Count - 1;

			if (!binaryList.Contains(0))
				return 0;

			if (binaryList[0] == 0)
			{
				for (int j = 0; j < binaryList.Count; j++)
				{
					if (binaryList[j] == 1)
					{
						minIndex = j;
						break;
					}
				}
			}

			if (binaryList[binaryList.Count - 1] == 0)
			{
				for (int j = binaryList.Count - 1; j > 0; j--)
				{
					if (binaryList[j] == 1)
					{
						maxIndex = j;
						break;
					}
				}
			}

			for (int i = minIndex; i < maxIndex; i++)
			{
				if (binaryList[i] == 0)
					count++;
				else
				{
					if (count > count2)
						count2 = count;

					count = 0;
				}
			}

			return count > count2 ? count : count2;
		}
	}
}
