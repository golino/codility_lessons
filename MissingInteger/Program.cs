using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MissingInteger
{
	class Program
	{
		static void Main(string[] args)
		{
			int[] A = new int[] { 1, 2 }; //{ 1, 3, 6, 4, 1, 2 };
			Console.WriteLine("A solucao é: {0}", solution(A));
			Console.ReadLine();
		}
		public static int solution(int[] A)
		{
			HashSet<int> items = new HashSet<int>(A);
			int max = items.Max();
			
			if (max <= 0)
				return 1;

			for (int i = 1; i < max; i++)
			{
				if (!items.Contains(i))
					return i;
			}

			return items.Max() + 1;
		}
	}
}
